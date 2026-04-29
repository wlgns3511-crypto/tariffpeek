// HCU 2026-04-24 IndexNow cleanup submission.
import Database from 'better-sqlite3';

const DB_PATH = '/Users/jihoon/projects/tariffpeek/data/tariff.db';
const HOST = 'tariffpeek.com';
const KEY = '2e20aece69994297bd9c487cf1e3b81b';

const db = new Database(DB_PATH, { readonly: true });
const chapters = db.prepare(`SELECT slug FROM codes WHERE level=2 ORDER BY slug`).all() as { slug: string }[];
const killed = db.prepare(`SELECT slug FROM codes WHERE level!=2 ORDER BY RANDOM() LIMIT 800`).all() as { slug: string }[];

const keptUrls = [
  `https://${HOST}/`,
  `https://${HOST}/sitemap.xml`,
  ...chapters.map(c => `https://${HOST}/code/${c.slug}/`),
  ...chapters.map(c => `https://${HOST}/code/${c.slug}/by-fta/`),
];
const killedUrls = killed.map(c => `https://${HOST}/code/${c.slug}/`);

async function submit(label: string, urls: string[]) {
  console.log(`[${label}] submitting ${urls.length} URLs...`);
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST, key: KEY,
      keyLocation: `https://${HOST}/${KEY}.txt`,
      urlList: urls.slice(0, 10000),
    }),
  });
  const body = await res.text();
  console.log(`[${label}] status ${res.status} ${body ? `body="${body.slice(0,200)}"` : ''}`);
}

(async () => {
  await submit('KEPT', keptUrls);
  await submit('KILLED', killedUrls);
})();
