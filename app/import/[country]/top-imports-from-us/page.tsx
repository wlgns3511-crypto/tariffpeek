import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Database from 'better-sqlite3';
import path from 'path';
import { existsSync } from 'fs';
import {
  getCountryBySlug,
  getAllCountries,
  getCountryOverallAvg,
} from '@/lib/db';
import { formatHSCode, cleanDescription } from '@/lib/format';
import { breadcrumbSchema, faqSchema, datasetSchema } from '@/lib/schema';
import { AdSlot } from '@/components/AdSlot';
import { AuthorBox } from '@/components/AuthorBox';
import { CrossSiteLinks } from '@/components/CrossSiteLinks';
import { FeedbackButton } from '@/components/FeedbackButton';
import { EditorNote } from '@/components/EditorNote';
import { DataSourceBadge } from '@/components/DataSourceBadge';
import { FreshnessTag } from '@/components/FreshnessTag';

export const dynamicParams = false;
export const revalidate = 86400;

interface Props {
  params: Promise<{ country: string }>;
}

/**
 * Mapping of country slug to the FTA that covers US-origin exports.
 * Source: USTR fact sheets, WCO agreement registry.
 */
const US_FTA_BY_COUNTRY: Record<string, string> = {
  australia: 'AUSFTA',
  canada: 'USMCA',
  japan: 'US-Japan Trade Agreement',
  korea: 'KORUS FTA',
  mexico: 'USMCA',
  singapore: 'USSFTA',
};

/**
 * Flag emoji map — mirrors the country overview page for visual consistency.
 */
const FLAG: Record<string, string> = {
  australia: '\u{1F1E6}\u{1F1FA}',
  brazil: '\u{1F1E7}\u{1F1F7}',
  canada: '\u{1F1E8}\u{1F1E6}',
  china: '\u{1F1E8}\u{1F1F3}',
  eu: '\u{1F1EA}\u{1F1FA}',
  india: '\u{1F1EE}\u{1F1F3}',
  indonesia: '\u{1F1EE}\u{1F1E9}',
  japan: '\u{1F1EF}\u{1F1F5}',
  korea: '\u{1F1F0}\u{1F1F7}',
  mexico: '\u{1F1F2}\u{1F1FD}',
  'saudi-arabia': '\u{1F1F8}\u{1F1E6}',
  singapore: '\u{1F1F8}\u{1F1EC}',
  'south-africa': '\u{1F1FF}\u{1F1E6}',
  taiwan: '\u{1F1F9}\u{1F1FC}',
  thailand: '\u{1F1F9}\u{1F1ED}',
  turkey: '\u{1F1F9}\u{1F1F7}',
  uae: '\u{1F1E6}\u{1F1EA}',
  uk: '\u{1F1EC}\u{1F1E7}',
  vietnam: '\u{1F1FB}\u{1F1F3}',
};

export async function generateStaticParams() {
  return getAllCountries()
    .filter((c) => c.slug !== 'us')
    .map((c) => ({ country: c.slug }));
}

/**
 * Open a read-only connection to tariff.db for page-specific aggregations
 * not covered by lib/db.ts helpers.
 */
function openDb(): Database.Database {
  const local = path.join(process.cwd(), 'data', 'tariff.db');
  const tmp = '/tmp/tariff.db';
  const dbPath = existsSync(local) ? local : tmp;
  return new Database(dbPath, { readonly: true, fileMustExist: true });
}

interface TariffRow {
  hs_code: string;
  description: string;
  mfn_rate: number;
  fta_rate: number | null;
  fta_name: string | null;
}

interface FTASavingsRow extends TariffRow {
  savings: number;
}

/** Build a tariff landscape view for US exporters into this country. */
function getUSExportSnapshot(countrySlug: string) {
  const db = openDb();
  try {
    const usFTA = US_FTA_BY_COUNTRY[countrySlug];

    // Top 10 biggest FTA savings if the US has an FTA here
    let topFTASavings: FTASavingsRow[] = [];
    let ftaAvgRate = 0;
    let ftaCount = 0;
    if (usFTA) {
      topFTASavings = (
        db
          .prepare(
            `SELECT ct.hs_code, c.description, ct.mfn_rate, ct.fta_rate, ct.fta_name
             FROM country_tariffs ct
             JOIN codes c ON ct.hs_code = c.hscode
             WHERE ct.country_slug = ? AND ct.fta_name = ? AND c.level >= 4
               AND ct.fta_rate IS NOT NULL AND ct.mfn_rate > ct.fta_rate
             ORDER BY (ct.mfn_rate - ct.fta_rate) DESC
             LIMIT 10`,
          )
          .all(countrySlug, usFTA) as TariffRow[]
      ).map((r) => ({ ...r, savings: r.mfn_rate - (r.fta_rate ?? 0) }));
      const ftaAgg = db
        .prepare(
          `SELECT COUNT(*) as cnt, ROUND(AVG(fta_rate), 2) as avg_fta
           FROM country_tariffs
           WHERE country_slug = ? AND fta_name = ?`,
        )
        .get(countrySlug, usFTA) as { cnt: number; avg_fta: number } | undefined;
      ftaCount = ftaAgg?.cnt ?? 0;
      ftaAvgRate = ftaAgg?.avg_fta ?? 0;
    }

    // Top 10 highest MFN barriers (what US exporters pay with no FTA)
    const topBarriers = db
      .prepare(
        `SELECT ct.hs_code, c.description, ct.mfn_rate, ct.fta_rate, ct.fta_name
         FROM country_tariffs ct
         JOIN codes c ON ct.hs_code = c.hscode
         WHERE ct.country_slug = ? AND c.level >= 4
         ORDER BY ct.mfn_rate DESC
         LIMIT 10`,
      )
      .all(countrySlug) as TariffRow[];

    // Top 10 zero-rated HS lines (easiest categories for US exporters)
    const zeroRated = db
      .prepare(
        `SELECT ct.hs_code, c.description, ct.mfn_rate, ct.fta_rate, ct.fta_name
         FROM country_tariffs ct
         JOIN codes c ON ct.hs_code = c.hscode
         WHERE ct.country_slug = ? AND c.level >= 4 AND ct.mfn_rate = 0
         ORDER BY ct.hs_code
         LIMIT 10`,
      )
      .all(countrySlug) as TariffRow[];

    // Aggregates
    const agg = db
      .prepare(
        `SELECT COUNT(*) as total,
                SUM(CASE WHEN mfn_rate = 0 THEN 1 ELSE 0 END) as zero_count,
                ROUND(AVG(mfn_rate), 2) as avg_mfn,
                MAX(mfn_rate) as max_mfn
         FROM country_tariffs ct
         JOIN codes c ON ct.hs_code = c.hscode
         WHERE ct.country_slug = ? AND c.level >= 4`,
      )
      .get(countrySlug) as { total: number; zero_count: number; avg_mfn: number; max_mfn: number };

    return { topFTASavings, topBarriers, zeroRated, ftaCount, ftaAvgRate, ...agg, usFTA };
  } finally {
    db.close();
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  if (country === 'us') return {};
  const cdata = getCountryBySlug(country);
  if (!cdata) return {};

  const overallAvg = getCountryOverallAvg(country);
  const usFTA = US_FTA_BY_COUNTRY[country];
  const title = usFTA
    ? `US Exports to ${cdata.name}: ${usFTA} tariff savings + top HS codes (2026)`
    : `US Exports to ${cdata.name}: MFN tariff landscape for American goods (2026)`;
  const description = usFTA
    ? `US-origin goods enter ${cdata.name} under ${usFTA}, averaging ~${overallAvg}% MFN but dropping sharply on covered HS codes. Top FTA savings, zero-rated products, and 2026 reciprocal-tariff impact for US exporters.`
    : `${cdata.name} has no FTA with the US — American exports pay full MFN (avg ${overallAvg}%). See the highest barriers, zero-rated easy wins, and 2026 tariff-war context for shipping US goods to ${cdata.name}.`;
  return {
    title,
    description,
    alternates: { canonical: `/import/${country}/top-imports-from-us/` },
    openGraph: { title, description, url: `/import/${country}/top-imports-from-us/` },
  };
}

function rateColor(rate: number): string {
  if (rate <= 2) return 'text-green-700 bg-green-50';
  if (rate <= 5) return 'text-blue-700 bg-blue-50';
  if (rate <= 10) return 'text-amber-700 bg-amber-50';
  if (rate <= 20) return 'text-orange-700 bg-orange-50';
  return 'text-red-700 bg-red-50';
}

export default async function TopImportsFromUSPage({ params }: Props) {
  const { country } = await params;
  if (country === 'us') notFound();
  const cdata = getCountryBySlug(country);
  if (!cdata) notFound();

  const snap = getUSExportSnapshot(country);
  const overallAvg = snap.avg_mfn;
  const zeroPct = snap.total > 0 ? ((snap.zero_count / snap.total) * 100).toFixed(1) : '0.0';
  const flag = FLAG[country] || '';
  const allCountries = getAllCountries();
  const peerCountries = allCountries
    .filter((c) => c.slug !== country && c.slug !== 'us')
    .slice(0, 6);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: `${flag} ${cdata.name} Tariffs`, url: `/import/${country}/` },
    { name: 'Top Imports from US', url: `/import/${country}/top-imports-from-us/` },
  ];

  // Savings magnitude shown in hero
  const ftaSavingsGap = snap.usFTA && snap.ftaAvgRate > 0 && overallAvg > snap.ftaAvgRate
    ? (overallAvg - snap.ftaAvgRate).toFixed(1)
    : null;

  const faqs = [
    {
      question: `Does the US have a free trade agreement with ${cdata.name}?`,
      answer: snap.usFTA
        ? `Yes. US-origin goods enter ${cdata.name} under the ${snap.usFTA}, which covers ${snap.ftaCount.toLocaleString()} HS code lines. The average MFN rate across all products in ${cdata.name} is ${overallAvg}%, but ${snap.usFTA}-eligible US exports average ${snap.ftaAvgRate}% — a ${ftaSavingsGap ?? '—'}pp savings on covered lines. Eligibility requires rules-of-origin documentation (certificate of origin or self-certification, depending on the agreement).`
        : `No. ${cdata.name} is not party to a bilateral FTA with the United States. US-origin goods pay the full Most-Favored-Nation (MFN) tariff rate — averaging ${overallAvg}% across ${snap.total.toLocaleString()} HS lines, with individual rates ranging from 0% to ${snap.max_mfn}%. For preferential rates, US exporters must either find a third-country transshipment point with FTA coverage or pursue WTO Schedule reductions.`,
    },
    {
      question: `What products have the lowest tariffs when imported from the US into ${cdata.name}?`,
      answer: snap.zero_count > 0
        ? `${cdata.name} applies 0% MFN duty to ${snap.zero_count.toLocaleString()} HS code lines (${zeroPct}% of the total tariff book). These are the easiest categories for US exporters — common examples include certain raw materials, pharmaceutical active ingredients, aircraft parts, and WTO Information Technology Agreement products. See the "zero-rated" list below for the top 10 starting points.`
        : `${cdata.name} applies duty to virtually all HS code lines. The lowest rates are in the 0–5% MFN band — raw materials, industrial inputs, and some capital equipment. There are no fully zero-rated product categories in our current snapshot of ${cdata.name}'s tariff schedule.`,
    },
    {
      question: `Which US exports face the highest tariffs in ${cdata.name}?`,
      answer: snap.topBarriers.length > 0
        ? `The highest MFN rates in ${cdata.name} hit ${snap.topBarriers.slice(0, 3).map((t) => `${cleanDescription(t.description).substring(0, 40)} (${t.mfn_rate}%)`).join(', ')}. Tariff peaks typically cluster in agricultural products, textiles, footwear, and protected manufacturing sectors. The maximum tariff rate we observe is ${snap.max_mfn}% — well above the ${overallAvg}% country average.`
        : `Detailed barrier data is being compiled for ${cdata.name}.`,
    },
    {
      question: `How do I claim ${snap.usFTA || 'preferential'} tariff treatment when shipping US goods to ${cdata.name}?`,
      answer: snap.usFTA
        ? `Three-step process: (1) Verify your HS code qualifies under ${snap.usFTA} rules of origin — this typically requires a minimum US-origin value or a specific tariff-shift classification. (2) Issue a Certificate of Origin (or self-certify, depending on the agreement). (3) Declare the preference code on the import entry filed with ${cdata.name}'s customs authority. ${snap.usFTA === 'USMCA' ? 'USMCA uses a self-certification model — no government-issued CO required.' : snap.usFTA === 'KORUS FTA' ? 'KORUS allows either exporter or importer to certify origin.' : 'Requirements vary — consult a licensed customs broker.'} Errors trigger retroactive duty assessments plus interest.`
        : `There is no US-specific preferential treatment available to US exporters shipping to ${cdata.name}. All US-origin goods pay the MFN rate declared on the import entry. Options to reduce landed cost: (1) Bonded warehousing for re-export, (2) Duty drawback on US-side exports if components were previously imported, (3) Foreign Trade Zone staging in the US before export. None of these reduce ${cdata.name}'s inbound tariff itself — they defer or reclaim US-side costs.`,
    },
    {
      question: `How are 2026 reciprocal tariffs affecting US exports to ${cdata.name}?`,
      answer: `The 2025-2026 reciprocal tariff framework introduced by the US administration has prompted retaliatory or adjustment measures from several trading partners. For ${cdata.name} specifically, the baseline MFN rates shown on this page reflect pre-retaliation WTO bindings; any 2026 surcharges, anti-dumping duties, or safeguard measures would stack on top. ${snap.usFTA ? `${snap.usFTA} coverage has held so far but specific chapters (notably steel, aluminum, and automotive) face section-specific tariffs layered above the FTA rate.` : `Without an FTA buffer, US exports to ${cdata.name} bear the full impact of any reciprocal or retaliatory tariff action.`} Monitor the USTR Federal Register notices and ${cdata.name}'s customs bulletin for live updates.`,
    },
    {
      question: `What's the typical landed cost for US goods in ${cdata.name}?`,
      answer: `Landed cost = product value + freight + insurance + import duty + VAT/GST + broker fees. For a generic $10,000 US shipment into ${cdata.name}: product $10,000 + freight ~$800-$1,500 (ocean LCL) + insurance ~$50-$100 + duty ${overallAvg}% (~$${Math.round(10000 * overallAvg / 100).toLocaleString()}) + local VAT/GST (typically 5-20% on CIF+duty) + broker fee $150-$500. Total landed cost typically 20-40% above invoice for non-FTA shipments, 10-25% above for FTA-eligible US-origin goods. Use the HS-code-specific pages for exact duty math.`,
    },
    {
      question: `Where can I look up the exact tariff rate for a specific product?`,
      answer: `Navigate to the ${cdata.name} tariff overview (linked at the top of this page) and browse by product chapter, or use the search tool to find your specific HS code. Each HS-code-specific page shows the MFN rate, any applicable FTA rates (including ${snap.usFTA ?? 'other preferences'}), import documents required, and peer-country comparison. If you already know your 6-digit HS subheading, the direct URL pattern is /import/${country}/[hs-code-slug]/.`,
    },
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }}
      />
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            datasetSchema(
              `US Exports to ${cdata.name}: Tariff Snapshot`,
              `Tariff landscape for US-origin goods entering ${cdata.name}: ${snap.usFTA ? `${snap.usFTA} FTA savings, ` : ''}top MFN barriers, zero-rated products, and 2026 reciprocal-tariff context for US exporters.`,
            ),
          ),
        }}
      />

      {/* Inline breadcrumb — this site uses text-based breadcrumbs */}
      <nav className="text-sm text-slate-500 mb-4">
        {breadcrumbs.map((b, i) => (
          <span key={i}>
            {i > 0 && ' / '}
            {i < breadcrumbs.length - 1 ? (
              <a href={b.url} className="hover:underline">
                {b.name}
              </a>
            ) : (
              <span className="text-slate-800">{b.name}</span>
            )}
          </span>
        ))}
      </nav>

      <h1 className="text-3xl font-bold mb-2">
        {flag} Exporting from US to {cdata.name}: Tariff Snapshot
      </h1>
      <p className="text-lg text-slate-600 mb-4">
        {snap.usFTA ? (
          <>
            US-origin goods enter {cdata.name} under <strong>{snap.usFTA}</strong>, covering{' '}
            {snap.ftaCount.toLocaleString()} HS lines at an average{' '}
            <strong>{snap.ftaAvgRate}%</strong> FTA rate — compared to {overallAvg}% MFN across{' '}
            {snap.total.toLocaleString()} total lines. A practical snapshot for US exporters.
          </>
        ) : (
          <>
            {cdata.name} has <strong>no bilateral FTA with the United States</strong>. US-origin
            goods pay the full MFN rate — averaging <strong>{overallAvg}%</strong> across{' '}
            {snap.total.toLocaleString()} HS lines, with individual rates from 0% to{' '}
            {snap.max_mfn}%.
          </>
        )}
      </p>

      <FreshnessTag source="WTO Tariff Download Facility + USTR FTA texts" />

      <EditorNote
        note={`This page summarizes the tariff posture a US exporter actually encounters when shipping to ${cdata.name} — not abstract averages. Rates shown are current MFN and FTA bindings from the WTO database; 2026 reciprocal tariffs, anti-dumping duties, and quota-triggered surcharges are NOT included and stack on top of these figures. For shipment-level decisions, verify the live rate with ${cdata.name}'s customs authority or a licensed US-based broker.`}
      />

      {/* Summary stats */}
      <section className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="bg-indigo-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-indigo-700">{overallAvg}%</div>
          <div className="text-xs text-slate-500 mt-1">Avg MFN Rate</div>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-emerald-700">
            {snap.usFTA ? `${snap.ftaAvgRate}%` : 'N/A'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {snap.usFTA ? `${snap.usFTA} Avg` : 'US-FTA Rate'}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{snap.zero_count.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">0% MFN lines ({zeroPct}%)</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-700">{snap.max_mfn}%</div>
          <div className="text-xs text-slate-500 mt-1">Peak MFN Rate</div>
        </div>
      </section>

      <AdSlot id="top" />

      {/* US FTA snapshot or MFN-only note */}
      {snap.usFTA ? (
        <section className="mb-8 rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              US-{cdata.name} FTA
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-slate-900 text-lg">
                {snap.usFTA} covers US-origin exports into {cdata.name}
              </h2>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                Across {snap.ftaCount.toLocaleString()} HS lines, the {snap.usFTA} reduces the
                average US-origin duty from the standard MFN rate (~{overallAvg}%) to{' '}
                <strong>{snap.ftaAvgRate}%</strong>.
                {ftaSavingsGap && (
                  <>
                    {' '}That&rsquo;s approximately <strong>{ftaSavingsGap} percentage points</strong> of
                    savings on qualifying US exports — meaningful for tight-margin industrial
                    shipments.
                  </>
                )}{' '}
                Rules-of-origin documentation is required; self-certification is permitted for
                {snap.usFTA === 'USMCA' ? ' USMCA' : snap.usFTA === 'KORUS FTA' ? ' KORUS' : ' most modern US FTAs'}.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50/60 p-5">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 rounded-lg bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              No US FTA
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-slate-900 text-lg">
                US exporters pay full MFN rates into {cdata.name}
              </h2>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                {cdata.name} and the United States have no bilateral free-trade agreement. US-origin
                goods are subject to the Most-Favored-Nation rate on the date of import — averaging{' '}
                {overallAvg}% across {snap.total.toLocaleString()} HS lines. Landed cost modeling
                for US→{cdata.name} shipments must assume the full MFN duty; there is no
                preferential treatment available at the US-origin level.
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Workaround strategies (bonded warehousing, duty drawback, Foreign Trade Zone
                staging) reduce US-side duty exposure, not {cdata.name}&rsquo;s inbound tariff.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Top FTA savings — only if US has an FTA here */}
      {snap.topFTASavings.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            Top 10 {snap.usFTA} Savings for US Exports to {cdata.name}
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            HS lines where the {snap.usFTA} preference produces the largest tariff reduction vs MFN.
            These are the highest-leverage product categories for US exporters.
          </p>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left text-xs text-slate-500 uppercase">HS Code</th>
                    <th className="p-3 text-left text-xs text-slate-500 uppercase">Product</th>
                    <th className="p-3 text-right text-xs text-slate-500 uppercase">MFN</th>
                    <th className="p-3 text-right text-xs text-slate-500 uppercase">
                      {snap.usFTA}
                    </th>
                    <th className="p-3 text-right text-xs text-slate-500 uppercase">Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {snap.topFTASavings.map((r) => (
                    <tr key={r.hs_code} className="border-t border-slate-100">
                      <td className="p-3 font-mono text-indigo-600">{formatHSCode(r.hs_code)}</td>
                      <td className="p-3">{cleanDescription(r.description).substring(0, 60)}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${rateColor(r.mfn_rate)}`}>
                          {r.mfn_rate}%
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${rateColor(r.fta_rate ?? 0)}`}>
                          {r.fta_rate ?? 0}%
                        </span>
                      </td>
                      <td className="p-3 text-right font-semibold text-emerald-700">
                        &minus;{r.savings.toFixed(1)}pp
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Savings shown in percentage points (pp). A US-origin shipment on a 20% MFN line dropping
            to 2% under {snap.usFTA} saves 18pp of CIF value in duty alone.
          </p>
        </section>
      )}

      {/* Top MFN barriers */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">
          Top 10 Highest MFN Barriers for {cdata.name}
        </h2>
        <p className="text-sm text-slate-600 mb-3">
          HS lines with the steepest MFN rates. These are the categories where US exporters face
          the strongest tariff headwinds{snap.usFTA ? ` (before ${snap.usFTA} preference)` : ''}.
          Agricultural, textile, and protected-manufacturing chapters typically dominate.
        </p>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="p-3 text-left text-xs text-slate-500 uppercase">HS Code</th>
                  <th className="p-3 text-left text-xs text-slate-500 uppercase">Product</th>
                  <th className="p-3 text-right text-xs text-slate-500 uppercase">MFN</th>
                  <th className="p-3 text-right text-xs text-slate-500 uppercase">FTA Rate</th>
                </tr>
              </thead>
              <tbody>
                {snap.topBarriers.map((r) => (
                  <tr key={r.hs_code} className="border-t border-slate-100">
                    <td className="p-3 font-mono text-indigo-600">
                      <a href={`/import/${country}/${r.hs_code}`} className="hover:underline">
                        {formatHSCode(r.hs_code)}
                      </a>
                    </td>
                    <td className="p-3">{cleanDescription(r.description).substring(0, 60)}</td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${rateColor(r.mfn_rate)}`}>
                        {r.mfn_rate}%
                      </span>
                    </td>
                    <td className="p-3 text-right text-slate-600">
                      {r.fta_rate !== null ? `${r.fta_rate}% (${r.fta_name})` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <AdSlot id="mid" />

      {/* Zero-rated easy wins */}
      {snap.zeroRated.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">
            Zero-Rated HS Lines: Easy Entry Points for US Exports
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            Product categories where {cdata.name} applies 0% MFN duty — ${snap.zero_count.toLocaleString()} HS lines
            total ({zeroPct}% of the tariff book). These are the lowest-friction starting points
            for first-time US exporters.
          </p>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left text-xs text-slate-500 uppercase">HS Code</th>
                    <th className="p-3 text-left text-xs text-slate-500 uppercase">Product</th>
                    <th className="p-3 text-right text-xs text-slate-500 uppercase">MFN</th>
                  </tr>
                </thead>
                <tbody>
                  {snap.zeroRated.map((r) => (
                    <tr key={r.hs_code} className="border-t border-slate-100">
                      <td className="p-3 font-mono text-indigo-600">
                        <a href={`/import/${country}/${r.hs_code}`} className="hover:underline">
                          {formatHSCode(r.hs_code)}
                        </a>
                      </td>
                      <td className="p-3">{cleanDescription(r.description).substring(0, 60)}</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 rounded text-xs font-bold text-green-700 bg-green-50">
                          0%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Zero MFN duty does not eliminate other costs: {cdata.name}&rsquo;s VAT/GST, customs
            broker fees, and any anti-dumping or safeguard measures still apply. VAT/GST is
            typically 5-20% on CIF + duty.
          </p>
        </section>
      )}

      {/* 2026 reciprocal tariff context */}
      <section className="mb-8 rounded-xl border border-blue-200 bg-blue-50/60 p-5">
        <h2 className="text-lg font-bold text-blue-900 mb-2">
          2026 Reciprocal-Tariff Context
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          The 2025 reciprocal tariff order and subsequent 2026 adjustments have reshaped the
          duty landscape for US exports. The rates on this page reflect WTO-bound MFN and FTA
          commitments — they do NOT include section-specific 2026 US tariffs (steel, aluminum,
          automotive, semiconductors) or {cdata.name}&rsquo;s retaliatory measures.
        </p>
        <p className="mt-2 text-sm text-slate-700 leading-relaxed">
          {snap.usFTA ? (
            <>
              {snap.usFTA} structural rates have held, but specific covered chapters may face
              stacked duties in 2026. USMCA automotive rules-of-origin tightening and KORUS steel
              quota enforcement are the live disputes to monitor.
            </>
          ) : (
            <>
              Without FTA coverage, US exports to {cdata.name} bear the full impact of any reciprocal
              or retaliatory action. Check USTR Federal Register notices before booking a shipment
              — surcharges can be announced with 15-30 day effective dates.
            </>
          )}
        </p>
      </section>

      {/* Peer countries */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Compare US Export Landscape to Other Markets</h2>
        <p className="text-sm text-slate-600 mb-3">
          Same snapshot for {cdata.name}&rsquo;s peer trading partners — useful for comparing FTA
          leverage and MFN exposure across your export portfolio.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {peerCountries.map((p) => (
            <a
              key={p.slug}
              href={`/import/${p.slug}/top-imports-from-us/`}
              className="block border rounded-lg p-3 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
            >
              <div className="font-semibold text-slate-900">
                {FLAG[p.slug] || ''} {p.name}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {US_FTA_BY_COUNTRY[p.slug]
                  ? `US FTA: ${US_FTA_BY_COUNTRY[p.slug]}`
                  : 'No US FTA — full MFN'}
              </div>
              <div className="text-xs text-slate-400 mt-1">View export snapshot &rarr;</div>
            </a>
          ))}
        </div>
      </section>

      <AdSlot id="bottom" />

      <AuthorBox />

      {/* FAQ */}
      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        {faqs.map((faq, i) => (
          <details key={i} className="border border-slate-200 rounded-lg mb-2" open={i === 0}>
            <summary className="p-4 cursor-pointer font-medium hover:bg-slate-50">
              {faq.question}
            </summary>
            <div className="px-4 pb-4 text-slate-600">{faq.answer}</div>
          </details>
        ))}
      </section>

      {/* Back link */}
      <div className="mt-8 mb-4">
        <a
          href={`/import/${country}/`}
          className="inline-flex items-center gap-2 text-sm font-medium text-indigo-700 hover:underline"
        >
          &larr; Back to {flag} {cdata.name} tariff overview
        </a>
      </div>

      <FeedbackButton pageId={`${country}-top-imports-from-us`} />

      <DataSourceBadge
        sources={[
          { name: 'WTO Tariff Download Facility', url: 'https://tariffdata.wto.org/' },
          { name: 'USTR FTA Texts', url: 'https://ustr.gov/trade-agreements' },
          { name: 'World Customs Organization HS Database', url: 'https://www.wcoomd.org/' },
        ]}
      />

      <p className="mt-8 text-xs text-slate-400 leading-relaxed">
        MFN and FTA rates are pulled from current WTO tariff-download snapshots and USTR-published
        agreement schedules. Rates do not include anti-dumping duties, countervailing duties,
        safeguard surcharges, or 2025-2026 reciprocal-tariff measures, which stack on top of these
        figures. Always verify with {cdata.name}&rsquo;s customs authority or a licensed customs
        broker before shipping. This page is educational and not legal, trade, or customs advice.
      </p>

      <CrossSiteLinks current="TariffPeek" />
    </div>
  );
}
