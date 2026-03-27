import { db } from "@/lib/db";

export async function GET() {
  const now = new Date().toUTCString();
  
  const codes = db.prepare("SELECT code, name, slug, description FROM hs_codes ORDER BY code LIMIT 15").all() as any[];

  const items = codes
    .map((c) => `
    <item>
      <title>HS ${c.code} - ${escapeXml(c.name)}</title>
      <link>https://tariffpeek.com/code/${c.slug}</link>
      <description>HS Code ${c.code}: ${escapeXml(c.description?.slice(0, 200) || c.name)}. Check US import tariff rates and required documents.</description>
      <pubDate>${now}</pubDate>
      <guid isPermaLink="false">https://tariffpeek.com/code/${c.slug}#${Date.now()}</guid>
    </item>`)
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>TariffPeek - HS Code &amp; Tariff Rate Database</title>
    <link>https://tariffpeek.com</link>
    <description>HS codes, US import tariff rates, FTA benefits, and trade compliance data.</description>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="https://tariffpeek.com/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
