#!/usr/bin/env tsx
/**
 * build-sitemap.ts — Static sitemap XML generator for tariffpeek.
 *
 * PRUNING HISTORY (post-HCU March 2026):
 *   2026-04-XX: 151,094 URLs → 153 indexed (0.1% indexation rate).
 *               GSC flagged 17 Dataset-schema errors. Cardinality collapse.
 *   2026-04-22: Pruned to Option B (~340 URLs) — "basic data + HCU-defense
 *               hubs only". Drops 138,800 country×code programmatic combos
 *               and 6,900+ leaf-level HS codes that were never real content.
 *
 * WHAT STAYS IN THE SITEMAP:
 *   Static pages                               ~10
 *   /section/[id]/                              21   (HS sections — IA backbone)
 *   /import/[country]/                          20   (country roots)
 *   /import/[country]/top-imports-from-us/      19   (Tier S HCU defense 04-21)
 *   /code/[slug]/  (level=2 HS chapters)        97   (real IA, not leaves)
 *   /code/[slug]/by-fta/  (level=2 only)        97   (Tier S HCU defense 04-21)
 *   /guide/ + individual guides                  6
 *   /blog/ + individual posts                   34
 *   /state/ + individual states                 52
 *                                             ────
 *                                             ~376
 *
 * WHAT GETS DROPPED (route still renders via dynamicParams=true):
 *   /import/[country]/[slug]/       138,800 — country × code combos
 *   /code/[slug]/  (level=4/5/6)      6,843 — HS leaf codes
 *   /es/code/[slug]/                  7,037 — Spanish variant
 *   /compare/[slug]/                    100 — dynamicParams=false, route self-caps
 *
 *   These URLs are NOT 404. They remain accessible at the route level. They
 *   simply lose sitemap-driven crawl priority so Google stops burning budget
 *   on thin programmatic pages. The ones with real backlinks or traffic can
 *   still get crawled; the rest fade from the index naturally.
 *
 * GROWTH PROTOCOL:
 *   If/when Tier 1 (this sitemap) hits >70% indexation rate, we can
 *   whitelist additions in this order:
 *     1. /code/[slug]/ level=4 (1,229 heading-level HS codes)
 *     2. /import/[country]/[slug]/ for top-50 trade codes × 20 countries (1,000)
 *     3. /es/ equivalents of whatever tier 1 + 2 proved to work
 *
 *   Do NOT just re-add everything. The lesson is "quality not cardinality".
 *
 * USAGE:
 *   npx tsx scripts/build-sitemap.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { getAllCodes, getAllSections, getAllCountries } from '../lib/db';
import { getAllPosts } from '../lib/blog';
import { getAllGuides } from '../lib/guides';
import { getAllStates } from '../lib/states-data';

const SITE_URL = 'https://tariffpeek.com';
const NOW = new Date().toISOString().split('T')[0];
const SHARD_SIZE = 40000;
const OUT_DIR = path.resolve(__dirname, '..', 'public');

interface Entry { url: string; lastmod?: string; priority?: string; changefreq?: string; }
function urlTag(e: Entry): string {
  return `  <url><loc>${e.url}</loc><lastmod>${e.lastmod ?? NOW}</lastmod><changefreq>${e.changefreq ?? 'monthly'}</changefreq><priority>${e.priority ?? '0.6'}</priority></url>`;
}
function writeShard(id: number, entries: Entry[]) {
  const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + entries.map(urlTag).join('\n') + '\n</urlset>\n';
  fs.writeFileSync(path.join(OUT_DIR, `sitemap-${id}.xml`), xml);
}

const seen = new Set<string>();
const entries: Entry[] = [];
function add(e: Entry) { if (!seen.has(e.url)) { seen.add(e.url); entries.push(e); } }

// Track per-segment counts so the final log tells the truth.
const counts: Record<string, number> = {
  static: 0, sections: 0, countries: 0, topImports: 0,
  codesL2: 0, byFta: 0, guides: 0, blog: 0, states: 0,
};
function count(seg: keyof typeof counts) { counts[seg]++; }

// ═══ Static pages ════════════════════════════════════════════════════════
// Includes legal/editorial pages — the HCU trust surface Google scans.
for (const [p, pr] of [
  ['/', '1.0'],
  ['/about/', '0.6'],
  ['/methodology/', '0.5'],
  ['/editorial-policy/', '0.5'],
  ['/corrections-policy/', '0.4'],
  ['/disclaimer/', '0.3'],
  ['/privacy/', '0.3'],
  ['/terms/', '0.3'],
  ['/contact/', '0.3'],
  ['/es/', '0.7'],
] as [string, string][]) {
  add({ url: `${SITE_URL}${p}`, priority: pr });
  count('static');
}

// ═══ HS sections (21) — top-level IA ═════════════════════════════════════
let sections: { id: string | number }[] = [];
try { sections = getAllSections(); } catch {}
for (const s of sections) {
  add({ url: `${SITE_URL}/section/${s.id}/`, priority: '0.8' });
  count('sections');
}

// ═══ Country import roots (20) ═══════════════════════════════════════════
let countries: { slug: string }[] = [];
try { countries = getAllCountries(); } catch {}
for (const c of countries) {
  add({ url: `${SITE_URL}/import/${c.slug}/`, priority: '0.8', changefreq: 'weekly' });
  count('countries');
}

// ═══ Country × "top imports from US" (19, excludes US) ═══════════════════
// Deployed 2026-04-21 as part of Tier S HCU defense. Keep indexed.
for (const c of countries) {
  if (c.slug !== 'us') {
    add({ url: `${SITE_URL}/import/${c.slug}/top-imports-from-us/`, priority: '0.7' });
    count('topImports');
  }
}

// ═══ HS codes — level=2 chapter pages only (97) ══════════════════════════
// 6,940 total codes, of which 97 are level=2 (HS chapters like "Live Animals",
// "Meat", "Dairy Produce"). These are real informational hubs. The 6,843
// level=4/5/6 codes are leaves that drag the site's avg quality down.
let codes: { slug: string; level?: number }[] = [];
try { codes = getAllCodes(); } catch {}
for (const c of codes) {
  if (c.level === 2) {
    add({ url: `${SITE_URL}/code/${c.slug}/`, priority: '0.7', changefreq: 'weekly' });
    count('codesL2');
  }
}

// ═══ HS chapter by-FTA subpages (97) ═════════════════════════════════════
// Deployed 2026-04-21 as Tier S HCU defense batch. Only level=2.
for (const c of codes) {
  if (c.level === 2) {
    add({ url: `${SITE_URL}/code/${c.slug}/by-fta/`, priority: '0.7' });
    count('byFta');
  }
}

// ═══ Guides (/guide/ hub + all guides) ═══════════════════════════════════
add({ url: `${SITE_URL}/guide/`, priority: '0.8', changefreq: 'weekly' });
count('guides');
for (const g of getAllGuides()) {
  add({
    url: `${SITE_URL}/guide/${g.slug}/`,
    lastmod: g.updatedAt ? new Date(g.updatedAt).toISOString().split('T')[0] : NOW,
    priority: '0.7',
  });
  count('guides');
}

// ═══ Blog (/blog/ hub + all posts) ═══════════════════════════════════════
add({ url: `${SITE_URL}/blog/`, priority: '0.8', changefreq: 'weekly' });
count('blog');
for (const p of getAllPosts()) {
  const lm = p.updatedAt ?? p.publishedAt;
  add({
    url: `${SITE_URL}/blog/${p.slug}/`,
    lastmod: lm ? new Date(lm).toISOString().split('T')[0] : NOW,
    priority: '0.7',
  });
  count('blog');
}

// ═══ States (/state/ hub + 51 states/DC) ═════════════════════════════════
add({ url: `${SITE_URL}/state/`, priority: '0.8' });
count('states');
for (const s of getAllStates()) {
  add({ url: `${SITE_URL}/state/${s.slug}/`, priority: '0.7' });
  count('states');
}

// ─── Cardinality guard ────────────────────────────────────────────────────
// Option B target is ~376. If this jumps past 1,000 something regressed —
// likely someone re-added one of the dropped loops. Fail fast so it's caught
// before hitting Googlebot.
if (entries.length > 1000) {
  throw new Error(
    `tariffpeek sitemap has ${entries.length.toLocaleString()} URLs — Option B budget is ~376.\n` +
      `Did a country×code, es/code, or leaf-level code loop get re-added?\n` +
      `Run with SITEMAP_LARGE_OK=1 if you genuinely meant to expand the tier.`,
  );
}

// ─── Clean old sitemaps ───────────────────────────────────────────────────
for (const f of fs.readdirSync(OUT_DIR)) {
  if (/^sitemap(-\d+)?\.xml$/.test(f)) fs.unlinkSync(path.join(OUT_DIR, f));
}
const oldDir = path.join(OUT_DIR, 'sitemap');
if (fs.existsSync(oldDir)) fs.rmSync(oldDir, { recursive: true, force: true });

// ─── Write ────────────────────────────────────────────────────────────────
const shardCount = Math.ceil(entries.length / SHARD_SIZE);
if (shardCount <= 1) {
  writeShard(0, entries);
  fs.renameSync(path.join(OUT_DIR, 'sitemap-0.xml'), path.join(OUT_DIR, 'sitemap.xml'));
} else {
  for (let i = 0; i < shardCount; i++) writeShard(i, entries.slice(i * SHARD_SIZE, (i + 1) * SHARD_SIZE));
  const idx = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    Array.from({ length: shardCount }, (_, i) => `  <sitemap><loc>${SITE_URL}/sitemap-${i}.xml</loc><lastmod>${NOW}</lastmod></sitemap>`).join('\n') + '\n</sitemapindex>\n';
  fs.writeFileSync(path.join(OUT_DIR, 'sitemap.xml'), idx);
}

// ─── Breakdown ────────────────────────────────────────────────────────────
console.log(`✓ ${entries.length} URLs, ${shardCount || 1} shard(s)`);
console.log('  breakdown:');
console.log(`    static            ${String(counts.static).padStart(4)}`);
console.log(`    /section/         ${String(counts.sections).padStart(4)}`);
console.log(`    /import/[c]/      ${String(counts.countries).padStart(4)}`);
console.log(`    top-imports-from-us ${String(counts.topImports).padStart(2)}`);
console.log(`    /code/ level=2    ${String(counts.codesL2).padStart(4)}`);
console.log(`    /code/[s]/by-fta/ ${String(counts.byFta).padStart(4)}`);
console.log(`    /guide/           ${String(counts.guides).padStart(4)}`);
console.log(`    /blog/            ${String(counts.blog).padStart(4)}`);
console.log(`    /state/           ${String(counts.states).padStart(4)}`);
