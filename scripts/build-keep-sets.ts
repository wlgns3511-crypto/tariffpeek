#!/usr/bin/env tsx
/**
 * build-keep-sets.ts — keep-set generators for middleware-level 410.
 *
 * Emits:
 *   lib/generated/code-keep.json        — 97 level-2 chapter slugs (HCU 4/24)
 *   lib/generated/import-slug-keep.json — slug-only set from
 *                                         getTopCountryTariffParams(500); used
 *                                         to 410 stale /import/{country}/{slug}/
 *                                         that Next would otherwise 404 (4/28
 *                                         CF analytics: ~30 hits/24h on
 *                                         /import/uae/961390-..., /import/brazil/53-...
 *                                         and similar legacy crawl-queue URLs).
 *
 * The slug list must match `generateStaticParams` exactly — otherwise Next
 * would 404 a URL we're still advertising in the sitemap.
 *
 * Run via `npm run build:keep-sets` before next build.
 */
import * as fs from 'fs';
import * as path from 'path';
import { getChapters, getTopCountryTariffParams } from '../lib/db';

const OUT_DIR = path.resolve(__dirname, '..', 'lib', 'generated');
fs.mkdirSync(OUT_DIR, { recursive: true });

// (1) /code/ keep-set
const chapters = getChapters();
const chapterSlugs = chapters.map((c) => c.slug).sort();
fs.writeFileSync(path.join(OUT_DIR, 'code-keep.json'), JSON.stringify(chapterSlugs));
console.log(`✓ code-keep.json — ${chapterSlugs.length} chapter slugs`);

// (2) /import/{country}/{slug}/ keep-set (slug dimension only — country
//     dimension is handled via the existing /import/[country]/ static set).
const importParams = getTopCountryTariffParams(500);
const importSlugs = Array.from(new Set(importParams.map((p) => p.slug))).sort();
fs.writeFileSync(path.join(OUT_DIR, 'import-slug-keep.json'), JSON.stringify(importSlugs));
console.log(`✓ import-slug-keep.json — ${importSlugs.length} slugs`);
