import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCountryBySlug,
  getAllCountries,
  getCountryAvgRates,
  getCountryOverallAvg,
  getCountryFtaPartners,
  getTariffsForCountry,
} from "@/lib/db";
import { formatHSCode } from "@/lib/format";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";

interface Props {
  params: Promise<{ country: string }>;
}

export const dynamicParams = false;
export const revalidate = 86400;

export async function generateStaticParams() {
  return getAllCountries().map((c) => ({ country: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country } = await params;
  const countryData = getCountryBySlug(country);
  if (!countryData) return {};

  const overallAvg = getCountryOverallAvg(country);
  const ftaPartners = getCountryFtaPartners(country);
  const topTariffs = getTariffsForCountry(country, 3);

  const ftaCount = ftaPartners.length;
  const highestRate = topTariffs.length > 0 ? topTariffs[0].mfn_rate : null;
  const highestLabel = topTariffs.length > 0
    ? topTariffs[0].description.replace(/[,;(].*/,"").trim().substring(0, 30).toLowerCase()
    : null;
  const ftaSnippet = ftaCount > 0 && ftaPartners[0]?.fta_name
    ? ` incl. ${ftaPartners[0].fta_name}` : "";

  return {
    title: `${countryData.name} Tariffs: Avg ${overallAvg}% MFN | ${ftaCount} ${ftaCount === 1 ? "FTA" : "FTAs"} (2026)`,
    description: `${countryData.name} average import tariff is ${overallAvg}% MFN.${highestRate ? ` Highest rate: ${highestLabel} at ${highestRate}%.` : ""} ${ftaCount} free trade ${ftaCount === 1 ? "agreement" : "agreements"}${ftaSnippet}. Browse duty rates for 97 HS product chapters.`,
    alternates: { canonical: `/import/${country}/` },
    openGraph: {
      title: `${countryData.name} Import Tariffs — ${overallAvg}% Avg MFN Rate`,
      description: `Compare ${countryData.name} duty rates across 97 HS chapters. ${ftaCount} FTAs available.`,
      url: `/import/${country}/`,
    },
  };
}

const FLAG: Record<string, string> = {
  us: "\u{1F1FA}\u{1F1F8}", cn: "\u{1F1E8}\u{1F1F3}", eu: "\u{1F1EA}\u{1F1FA}",
  japan: "\u{1F1EF}\u{1F1F5}", korea: "\u{1F1F0}\u{1F1F7}", uk: "\u{1F1EC}\u{1F1E7}",
  india: "\u{1F1EE}\u{1F1F3}", canada: "\u{1F1E8}\u{1F1E6}", mexico: "\u{1F1F2}\u{1F1FD}",
  brazil: "\u{1F1E7}\u{1F1F7}", australia: "\u{1F1E6}\u{1F1FA}", vietnam: "\u{1F1FB}\u{1F1F3}",
  thailand: "\u{1F1F9}\u{1F1ED}", taiwan: "\u{1F1F9}\u{1F1FC}", indonesia: "\u{1F1EE}\u{1F1E9}",
  turkey: "\u{1F1F9}\u{1F1F7}", singapore: "\u{1F1F8}\u{1F1EC}", uae: "\u{1F1E6}\u{1F1EA}",
  "saudi-arabia": "\u{1F1F8}\u{1F1E6}", "south-africa": "\u{1F1FF}\u{1F1E6}",
};

function rateColor(rate: number): string {
  if (rate <= 2) return "text-green-700 bg-green-50";
  if (rate <= 5) return "text-blue-700 bg-blue-50";
  if (rate <= 10) return "text-amber-700 bg-amber-50";
  if (rate <= 20) return "text-orange-700 bg-orange-50";
  return "text-red-700 bg-red-50";
}

export default async function CountryOverviewPage({ params }: Props) {
  const { country } = await params;
  const countryData = getCountryBySlug(country);
  if (!countryData) notFound();

  const avgRates = getCountryAvgRates(country);
  const overallAvg = getCountryOverallAvg(country);
  const ftaPartners = getCountryFtaPartners(country);
  const topTariffs = getTariffsForCountry(country, 20);
  const allCountries = getAllCountries();
  const flag = FLAG[country] || "";

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: `${flag} ${countryData.name} Tariffs`, url: `/import/${country}/` },
  ];

  const faqs = [
    {
      question: `What is the average import tariff rate in ${countryData.name}?`,
      answer: `The average MFN tariff rate across all product categories in ${countryData.name} is approximately ${overallAvg}%. Rates vary significantly by product category, from 0% for some raw materials to over 20% for protected sectors.`,
    },
    {
      question: `Does ${countryData.name} have free trade agreements?`,
      answer: ftaPartners.length > 0
        ? `Yes, ${countryData.name} has several FTAs including: ${ftaPartners.slice(0, 5).map((f) => f.fta_name).join(", ")}. These agreements offer reduced or zero tariff rates for qualifying products.`
        : `${countryData.name} has limited FTA coverage. Most imports are subject to standard MFN rates.`,
    },
    {
      question: `Which products have the highest tariffs in ${countryData.name}?`,
      answer: topTariffs.length > 0
        ? `The highest tariff rates in ${countryData.name} are found in categories like ${topTariffs.slice(0, 3).map((t) => `${t.description.substring(0, 40)} (${t.mfn_rate}%)`).join(", ")}.`
        : "Tariff data is being compiled.",
    },
    {
      question: `How do I look up a specific HS code tariff for ${countryData.name}?`,
      answer: `Use our search tool to find the specific HS code, then navigate to the ${countryData.name} tariff page for that code. Each page shows the MFN rate, any applicable FTA rates, and required import documents.`,
    },
  ];

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        {breadcrumbs.map((b, i) => (
          <span key={i}>
            {i > 0 && " / "}
            {i < breadcrumbs.length - 1 ? (
              <a href={b.url} className="hover:underline">{b.name}</a>
            ) : (
              <span className="text-slate-800">{b.name}</span>
            )}
          </span>
        ))}
      </nav>

      <h1 className="text-3xl font-bold mb-2">
        {flag} {countryData.name} Import Tariff Rates
      </h1>
      <p className="text-lg text-slate-600 mb-8">
        Complete guide to import duty rates for {countryData.name}. Browse tariff rates by product category and HS code.
      </p>

      {/* Depth-layer-2 cross-link: US exporter snapshot — HCU Batch 7 (2026-04-21) */}
      {country !== 'us' && (
        <section className="my-6">
          <a
            href={`/import/${country}/top-imports-from-us/`}
            className="block rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 transition hover:border-emerald-400 hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl" aria-hidden="true">&#x1F1FA;&#x1F1F8;</div>
              <div className="flex-1">
                <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700 mb-1">
                  New &middot; US exporter snapshot
                </div>
                <div className="font-bold text-slate-900 text-base mb-1">
                  Exporting from US to {countryData.name}: FTA savings + MFN barriers decoded
                </div>
                <p className="text-sm text-slate-600">
                  Tariff landscape for US-origin goods: biggest FTA savings, top MFN barriers, zero-rated starting points, and 2026 reciprocal-tariff context.
                </p>
                <div className="mt-2 text-sm font-medium text-emerald-700">See US export snapshot &rarr;</div>
              </div>
            </div>
          </a>
        </section>
      )}

      {/* Summary Stats */}
      <section className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-indigo-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-indigo-700">{overallAvg}%</div>
          <div className="text-xs text-slate-500 mt-1">Average MFN Rate</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{ftaPartners.length}</div>
          <div className="text-xs text-slate-500 mt-1">FTA Partners</div>
        </div>
        <div className="bg-amber-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-amber-700">{avgRates.length}</div>
          <div className="text-xs text-slate-500 mt-1">Product Chapters</div>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-slate-700">
            {topTariffs.length > 0 ? `${topTariffs[0].mfn_rate}%` : "N/A"}
          </div>
          <div className="text-xs text-slate-500 mt-1">Highest Rate</div>
        </div>
      </section>

      {/* Average Rates by Category */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Average Tariff Rates by Product Category</h2>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 font-medium">Chapter</th>
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-right p-3 font-medium">Avg. MFN Rate</th>
              </tr>
            </thead>
            <tbody>
              {avgRates.slice(0, 30).map((r, i) => (
                <tr key={r.chapter} className={`border-t border-slate-100 ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}>
                  <td className="p-3 font-mono text-indigo-600">{r.chapter}</td>
                  <td className="p-3">{r.description ? r.description.substring(0, 60) : `Chapter ${r.chapter}`}</td>
                  <td className="text-right p-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${rateColor(r.avg_rate)}`}>
                      {r.avg_rate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FTA Partners */}
      {ftaPartners.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Free Trade Agreements</h2>
          <p className="text-sm text-slate-500 mb-3">
            {countryData.name} has preferential trade agreements that reduce or eliminate tariffs on qualifying products.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {ftaPartners.map((fta) => (
              <div key={fta.fta_name} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="font-medium text-green-800">{fta.fta_name}</div>
                <div className="text-xs text-green-600 mt-1">Covers {fta.count.toLocaleString()} product codes</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Highest Tariff Products */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Highest Tariff Products</h2>
        <div className="space-y-2">
          {topTariffs.slice(0, 10).map((t) => (
            <a
              key={t.hs_code}
              href={`/import/${country}/${t.slug}`}
              className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-indigo-600 text-sm w-16">{formatHSCode(t.hs_code)}</span>
                <span className="text-sm text-slate-700">{t.description.substring(0, 50)}</span>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${rateColor(t.mfn_rate)}`}>
                {t.mfn_rate}%
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Browse Other Countries */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Browse Other Countries</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {allCountries
            .filter((c) => c.slug !== country)
            .map((c) => (
              <a
                key={c.slug}
                href={`/import/${c.slug}`}
                className="p-3 bg-slate-50 rounded-lg text-sm hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-center"
              >
                {FLAG[c.slug] || ""} {c.name}
              </a>
            ))}
        </div>
      </section>

      {/* CPC Section */}
      <section className="mb-8 p-6 bg-orange-50 rounded-xl border border-orange-100">
        <h3 className="text-lg font-semibold text-orange-900 mb-3">
          Import Into {countryData.name}?
        </h3>
        <p className="text-orange-800 text-sm leading-relaxed">
          Find licensed customs brokers specializing in {countryData.name} imports.
          Compare freight forwarding rates, trade compliance solutions, and cargo insurance quotes
          for shipping to {countryData.name}.
        </p>
      </section>

      {/* FAQ */}
      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        {faqs.map((faq, i) => (
          <details key={i} className="border border-slate-200 rounded-lg mb-2" open={i === 0}>
            <summary className="p-4 cursor-pointer font-medium hover:bg-slate-50">{faq.question}</summary>
            <div className="px-4 pb-4 text-slate-600">{faq.answer}</div>
          </details>
        ))}
      </section>

      <p className="text-xs text-slate-400 mt-6">
        Data is approximate and for informational purposes only. Verify with the official customs authority of {countryData.name}.
      </p>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      {faqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />}
    </div>
  );
}
