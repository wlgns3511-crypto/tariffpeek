import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getCodeBySlug,
  getChapters,
  getAllCountryTariffsForCode,
  type CountryTariff,
} from "@/lib/db";
import { formatHSCode } from "@/lib/format";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { AdSlot } from "@/components/AdSlot";
import { EditorNote } from "@/components/EditorNote";
import { FreshnessTag } from "@/components/FreshnessTag";
import { DataSourceBadge } from "@/components/DataSourceBadge";
import { AuthorBox } from "@/components/AuthorBox";
import { CrossSiteLinks } from "@/components/CrossSiteLinks";
import { FeedbackButton } from "@/components/FeedbackButton";

// Tier S HCU expansion 2026-04-21 — FTA-preference breakdown per HS chapter (level=2)
// Chapter-level only (97 chapters) to keep content dense and HCU-safe. The page groups
// country tariff rates by free-trade-agreement program and shows the MFN-to-FTA savings
// gap that AI-generated pages miss because it requires joining 20 country rows per chapter.

export const dynamicParams = false;
export const revalidate = 86400;

export async function generateStaticParams() {
  // Only chapter-level codes (level=2, 97 entries). Heading/subheading level pages
  // would produce thin duplicates against the chapter scope.
  return getChapters().map((c) => ({ slug: c.slug }));
}

interface FTAGroup {
  ftaName: string;
  rows: CountryTariff[];
  avgMfn: number;
  avgFta: number;
  savings: number; // avg MFN - avg FTA
}

function groupByFTA(rows: CountryTariff[]): FTAGroup[] {
  const withFta = rows.filter((r) => r.fta_rate !== null && r.fta_name);
  const bucket = new Map<string, CountryTariff[]>();
  for (const row of withFta) {
    const key = row.fta_name || "Other";
    if (!bucket.has(key)) bucket.set(key, []);
    bucket.get(key)!.push(row);
  }
  const groups: FTAGroup[] = [];
  for (const [ftaName, groupRows] of bucket) {
    const avgMfn =
      groupRows.reduce((s, r) => s + r.mfn_rate, 0) / groupRows.length;
    const avgFta =
      groupRows.reduce((s, r) => s + (r.fta_rate ?? 0), 0) / groupRows.length;
    groups.push({
      ftaName,
      rows: groupRows,
      avgMfn,
      avgFta,
      savings: avgMfn - avgFta,
    });
  }
  // Sort by savings descending (biggest preferential benefit first)
  groups.sort((a, b) => b.savings - a.savings);
  return groups;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const code = getCodeBySlug(slug);
  if (!code || code.level !== 2) return { title: "Chapter not found" };
  const rows = getAllCountryTariffsForCode(code.hscode);
  const groups = groupByFTA(rows);
  const withFta = rows.filter((r) => r.fta_rate !== null).length;
  const formatted = formatHSCode(code.hscode);
  const topGroup = groups[0];
  const topAnswer = topGroup
    ? `HS chapter ${formatted} (${code.description}) is covered by ${groups.length} free-trade-agreement programs across ${rows.length} tracked countries. The biggest preferential-rate gap is ${topGroup.ftaName}, averaging ${topGroup.avgMfn.toFixed(1)}% MFN → ${topGroup.avgFta.toFixed(1)}% FTA (${topGroup.savings.toFixed(1)} percentage-point saving). ${withFta} of ${rows.length} countries grant a preferential rate for this chapter — the rest charge MFN to every origin.`
    : `HS chapter ${formatted} (${code.description}) tariff rates across ${rows.length} tracked countries. No FTA preferences are currently recorded for this chapter.`;
  const title = `HS ${formatted} by FTA: ${code.description.slice(0, 40)} Preferential Rates`;
  return {
    title,
    description: topAnswer,
    alternates: { canonical: `/code/${slug}/by-fta/` },
    openGraph: { title, description: topAnswer, url: `/code/${slug}/by-fta/` },
  };
}

export default async function CodeByFtaPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const code = getCodeBySlug(slug);
  if (!code) notFound();
  if (code.level !== 2) notFound();

  const rows = getAllCountryTariffsForCode(code.hscode);
  if (rows.length === 0) notFound();

  const groups = groupByFTA(rows);
  const withFtaCount = rows.filter((r) => r.fta_rate !== null).length;
  const mfnOnlyCountries = rows.filter((r) => r.fta_rate === null);
  const formatted = formatHSCode(code.hscode);

  // Spotlight picks
  const biggestGap = groups[0];
  const cheapestMfn = [...rows].sort((a, b) => a.mfn_rate - b.mfn_rate)[0];
  const highestMfn = [...rows].sort((a, b) => b.mfn_rate - a.mfn_rate)[0];
  const avgMfnGlobal = rows.reduce((s, r) => s + r.mfn_rate, 0) / rows.length;

  const topAnswer = biggestGap
    ? `HS chapter ${formatted} (${code.description}) is covered by ${groups.length} free-trade-agreement programs across ${rows.length} tracked countries. The biggest preferential-rate gap is ${biggestGap.ftaName}, averaging ${biggestGap.avgMfn.toFixed(1)}% MFN → ${biggestGap.avgFta.toFixed(1)}% FTA (${biggestGap.savings.toFixed(1)} percentage-point saving). ${withFtaCount} of ${rows.length} countries grant a preferential rate for this chapter — the rest charge MFN to every origin.`
    : `HS chapter ${formatted} (${code.description}) tariff rates across ${rows.length} tracked countries. No FTA preferences are currently recorded for this chapter.`;

  const faqs = [
    {
      question: `Which FTA offers the biggest savings for HS ${formatted}?`,
      answer: biggestGap
        ? `${biggestGap.ftaName} delivers the largest gap — an average ${biggestGap.savings.toFixed(1)} percentage points below MFN (${biggestGap.avgMfn.toFixed(1)}% MFN → ${biggestGap.avgFta.toFixed(1)}% FTA) across ${biggestGap.rows.length} countries in our dataset. That number is the savings ceiling; actual claimable savings depend on whether your product meets the FTA's rules-of-origin requirements and whether you can provide a valid certificate of origin at the time of entry.`
        : `No FTA preferences are recorded for this chapter in the dataset. All tracked countries currently charge the MFN rate regardless of origin.`,
    },
    {
      question: "What does 'MFN' mean and why does it matter here?",
      answer: `MFN stands for Most Favored Nation — the default tariff rate a WTO member charges imports from any country it doesn't have a preferential agreement with. Every row on this page shows MFN as the baseline; FTA rates only apply when the importer files a valid certificate of origin proving the goods qualify under the specific trade agreement (USMCA, KORUS, RCEP, EU CETA, etc.). If you can't prove origin, you pay MFN even if an FTA exists.`,
    },
    {
      question: "Why do some countries show no FTA rate?",
      answer: `For this chapter, ${mfnOnlyCountries.length} countries don't have a preferential program recorded (they charge MFN to all origins), or the FTA they're party to doesn't cover HS chapter ${formatted} — some FTAs carve out sensitive sectors (agriculture, textiles, autos) from preferential treatment. Check the official FTA tariff schedule for exclusions before assuming a preference applies.`,
    },
    {
      question: "How does the average MFN rate here compare to other chapters?",
      answer: `Chapter ${formatted} averages ${avgMfnGlobal.toFixed(1)}% MFN across ${rows.length} tracked countries. For context, most manufactured goods chapters land between 2–8% MFN; agricultural chapters (01-24) often run 10-40% due to tariff rate quotas and specific duties; sensitive sectors (textiles, footwear) typically 8-20%. The highest MFN in this chapter belongs to ${highestMfn.country_name} at ${highestMfn.mfn_rate}%.`,
    },
    {
      question: "Is the FTA rate always the rate I'll actually pay?",
      answer: `Only if your product qualifies under the FTA's rules of origin AND you file the certificate of origin correctly at entry. Failure modes: (1) insufficient regional value content (the product uses too many non-originating inputs), (2) missing or incorrect Form A / USMCA certification, (3) the specific 6-digit or 10-digit HS code sits in an FTA's exclusion list even though the chapter is generally covered. When in doubt, request a CBP binding ruling before shipping.`,
    },
    {
      question: "What's the cheapest legal entry path for this chapter?",
      answer: cheapestMfn
        ? `The lowest MFN rate in the dataset is ${cheapestMfn.country_name} at ${cheapestMfn.mfn_rate}%${cheapestMfn.fta_rate !== null ? ` (further reduced to ${cheapestMfn.fta_rate}% under ${cheapestMfn.fta_name})` : ""}. But "cheapest" depends on your destination market — this table is organized by importing country, not exporting country. A low MFN in Singapore doesn't help if you're shipping to the US.`
        : `Data unavailable.`,
    },
    {
      question: "Where do these tariff numbers come from?",
      answer: `The MFN rates are aggregated from official WTO tariff schedules and country-specific customs authority publications (USITC HTS for the US, EU TARIC, Canada's Customs Tariff, etc.). FTA rates are drawn from USTR and trade-ministry bilateral-agreement texts. Rates update annually at minimum; Section 301 and antidumping overrides are NOT reflected here and must be checked separately on the USITC and CBP websites.`,
    },
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbSchema([
              { name: "Home", url: "/" },
              { name: `HS ${formatted}`, url: `/code/${slug}/` },
              { name: "By FTA preference", url: `/code/${slug}/by-fta/` },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />

      <nav className="text-sm text-slate-500 mb-4">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/code/${slug}/`} className="hover:underline">
          HS {formatted}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">By FTA preference</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">
        HS {formatted} by FTA preference: {code.description}
      </h1>
      <p className="text-slate-600 mb-4 leading-relaxed">{topAnswer}</p>

      <EditorNote
        note={`This page shows the MFN-to-FTA gap per free-trade-agreement program for HS chapter ${formatted}. Rates apply at the chapter level and may differ for specific 6-digit or 10-digit sub-codes — always verify on the importing country's official tariff schedule before filing entry.`}
      />

      <FreshnessTag />

      {/* ---- Spotlight cards ---- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {biggestGap && (
          <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
              Biggest FTA saving
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {biggestGap.ftaName}
            </div>
            <div className="text-sm text-slate-600 mb-3">
              {biggestGap.rows.length} countries · avg MFN {biggestGap.avgMfn.toFixed(1)}%
            </div>
            <div className="text-3xl font-mono font-bold text-emerald-700">
              −{biggestGap.savings.toFixed(1)} pp
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Drops to avg {biggestGap.avgFta.toFixed(1)}% under FTA
            </div>
          </div>
        )}
        {highestMfn && (
          <div className="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-orange-50 p-5">
            <div className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2">
              Highest MFN wall
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {highestMfn.country_name}
            </div>
            <div className="text-sm text-slate-600 mb-3">
              {highestMfn.fta_name && highestMfn.fta_rate !== null
                ? `${highestMfn.fta_name} cuts to ${highestMfn.fta_rate}%`
                : "No FTA preference recorded"}
            </div>
            <div className="text-3xl font-mono font-bold text-red-700">
              {highestMfn.mfn_rate}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              MFN baseline — {(highestMfn.mfn_rate - avgMfnGlobal).toFixed(1)} pp above chapter average
            </div>
          </div>
        )}
        {cheapestMfn && (
          <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">
              Cheapest entry (any origin)
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-1">
              {cheapestMfn.country_name}
            </div>
            <div className="text-sm text-slate-600 mb-3">
              {cheapestMfn.fta_rate !== null
                ? `${cheapestMfn.fta_name} drops to ${cheapestMfn.fta_rate}%`
                : "MFN applies to every origin"}
            </div>
            <div className="text-3xl font-mono font-bold text-blue-700">
              {cheapestMfn.mfn_rate}%
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Lowest MFN rate across {rows.length} tracked countries
            </div>
          </div>
        )}
      </section>

      <AdSlot id="by-fta-spotlight" />

      {/* ---- FTA group breakdown ---- */}
      {groups.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3">
            FTA programs covering HS {formatted}
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Each card groups the countries in our dataset that apply the same
            free-trade-agreement preference. &quot;Savings&quot; is the average gap between the
            MFN baseline and the preferential rate — the ceiling for duty savings if
            your product qualifies under the FTA&apos;s rules of origin.
          </p>
          <div className="space-y-3">
            {groups.map((g) => (
              <div
                key={g.ftaName}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
                  <div>
                    <div className="font-semibold text-slate-900">{g.ftaName}</div>
                    <div className="text-xs text-slate-500">
                      {g.rows.length} {g.rows.length === 1 ? "country" : "countries"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm text-slate-600">
                      {g.avgMfn.toFixed(1)}% MFN →{" "}
                      <span className="text-emerald-700 font-semibold">
                        {g.avgFta.toFixed(1)}% FTA
                      </span>
                    </div>
                    <div className="text-xs text-emerald-700 font-medium">
                      −{g.savings.toFixed(1)} pp saving
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                  {g.rows.map((r) => (
                    // 2026-04-28 — link target redirect: /import/${country}/${slug}/ (noindex) → /import/${country}/ (indexable hub)
                    <Link
                      key={r.country_slug}
                      href={`/import/${r.country_slug}/`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-full text-xs text-slate-700 transition"
                    >
                      <span className="font-medium">{r.country_name}</span>
                      <span className="font-mono text-slate-400">
                        {r.mfn_rate}% → {r.fta_rate}%
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---- MFN-only countries ---- */}
      {mfnOnlyCountries.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold mb-3">
            Countries charging MFN to every origin
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            {mfnOnlyCountries.length} of {rows.length} countries have no recorded FTA
            preference for chapter {formatted}. Goods entering these markets pay the MFN
            rate regardless of exporter — either no FTA exists, or this chapter is
            excluded from the bilateral agreement.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-left">
                  <th className="p-3 font-semibold">Country</th>
                  <th className="p-3 font-semibold text-right">MFN rate</th>
                  <th className="p-3 font-semibold">vs chapter avg</th>
                </tr>
              </thead>
              <tbody>
                {[...mfnOnlyCountries]
                  .sort((a, b) => b.mfn_rate - a.mfn_rate)
                  .map((r) => {
                    const diff = r.mfn_rate - avgMfnGlobal;
                    const sign = diff >= 0 ? "+" : "";
                    return (
                      <tr key={r.country_slug} className="border-t hover:bg-slate-50">
                        <td className="p-3 font-medium">
                          {/* 2026-04-28 — link target redirect: /import/${country}/${slug}/ (noindex) → /import/${country}/ (indexable hub) */}
                          <Link
                            href={`/import/${r.country_slug}/`}
                            className="text-indigo-700 hover:underline"
                          >
                            {r.country_name}
                          </Link>
                        </td>
                        <td className="p-3 text-right font-mono">{r.mfn_rate}%</td>
                        <td
                          className={`p-3 text-xs ${diff >= 0 ? "text-red-600" : "text-emerald-600"}`}
                        >
                          {sign}
                          {diff.toFixed(1)} pp
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ---- Rules-of-origin primer ---- */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-3">
          How to actually claim an FTA preference for HS {formatted}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="font-semibold text-slate-900 mb-1">
              1. Confirm the rules of origin
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every FTA defines its own rules of origin (RoO). The two common forms are
              <strong> tariff shift</strong> (inputs must change HS heading during
              production) and <strong>regional value content</strong> (a minimum % of
              value must originate in the FTA region). Check the specific chapter&apos;s
              RoO in the FTA text before filing.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="font-semibold text-slate-900 mb-1">
              2. File the certificate of origin
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              USMCA, KORUS, and AUSFTA use self-certification by the exporter,
              producer, or importer. EU agreements typically require a EUR.1 movement
              certificate or a registered-exporter (REX) statement. Keep supporting
              records for 5 years minimum — post-entry audits are routine.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="font-semibold text-slate-900 mb-1">
              3. Verify the 6-digit sub-code
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Chapter-level rates shown here are averages. Some sub-codes within
              chapter {formatted} may carry higher MFN or sit on an FTA exclusion list.
              Drill down to the 6-digit or 10-digit level on the importing country&apos;s
              official tariff schedule before quoting landed cost.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="font-semibold text-slate-900 mb-1">
              4. Check Section 301 and AD/CVD overrides
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              For US imports from China, Section 301 duties (currently 7.5–25%) stack
              on top of MFN and are NOT reduced by FTAs. Antidumping and countervailing
              duty orders apply to specific product-country pairs regardless of FTA
              status. Always check the CBP ACE portal for active orders.
            </p>
          </div>
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4">Frequently asked questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="border border-slate-200 rounded-lg"
              open={i === 0}
            >
              <summary className="px-4 py-3 font-medium cursor-pointer hover:bg-slate-50">
                {faq.question}
              </summary>
              <p className="px-4 pb-3 text-sm text-slate-600 leading-relaxed">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ---- Parent back-link ---- */}
      <section className="my-8">
        <Link
          href={`/code/${slug}/`}
          className="block rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 hover:border-indigo-400 hover:shadow-sm transition-all"
        >
          <div className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">
            ← Back to the chapter page
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            HS {formatted} — full chapter detail, child codes, and US import guide
          </h3>
          <p className="text-sm text-slate-600">
            See the US duty rate, 6-digit sub-classifications, required import documents,
            and Section 301 / AD/CVD context for {code.description.toLowerCase()}.
          </p>
        </Link>
      </section>

      <DataSourceBadge
        sources={[
          { name: "WCO Harmonized System", url: "https://www.wcoomd.org/en/topics/nomenclature/overview.aspx" },
          { name: "USITC HTS", url: "https://hts.usitc.gov/" },
          { name: "USTR FTAs", url: "https://ustr.gov/trade-agreements/free-trade-agreements" },
          { name: "WTO Tariff Database", url: "https://tariffdata.wto.org/" },
        ]}
      />

      <FeedbackButton pageId={`code-by-fta:${slug}`} />

      <AuthorBox />

      <CrossSiteLinks current="tariffpeek" />

      <AdSlot id="by-fta-bottom" />
    </div>
  );
}
