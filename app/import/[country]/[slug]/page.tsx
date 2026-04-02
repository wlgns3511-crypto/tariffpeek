import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getCountryBySlug,
  getCountryTariffBySlug,
  getAllCountryTariffsForCode,
  getCodeBySlug,
  getTopCountryTariffParams,
  getRelatedCodes,
  getAllCountries,
} from "@/lib/db";
import { formatHSCode, levelLabel } from "@/lib/format";
import { AdSlot } from "@/components/AdSlot";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { getRequiredDocs } from "@/lib/documents";

interface Props {
  params: Promise<{ country: string; slug: string }>;
}

function readableCountry(country: string): string {
  return decodeURIComponent(country).split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function hsCodeFromSlug(slug: string): string | null {
  return slug.match(/^(\d{2,10})/)?.[1] ?? null;
}

export const dynamicParams = false;
export const revalidate = false;

export async function generateStaticParams() {
  return getTopCountryTariffParams(50);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { country, slug } = await params;
  const countryName = readableCountry(country);
  const hsCode = hsCodeFromSlug(slug);
  const formattedHsCode = hsCode ? formatHSCode(hsCode) : slug;
  const description = `Lookup import duty, tariff notes, and trade documentation for HS ${formattedHsCode} in ${countryName}.`;

  return {
    title: `${countryName} Import Tariff for HS ${formattedHsCode} — Tariff Lookup`,
    description,
    alternates: { canonical: `/import/${country}/${slug}` },
    openGraph: { url: `/import/${country}/${slug}` },
  };
}

// Country flag emoji map
const FLAG: Record<string, string> = {
  us: "\u{1F1FA}\u{1F1F8}", cn: "\u{1F1E8}\u{1F1F3}", eu: "\u{1F1EA}\u{1F1FA}",
  japan: "\u{1F1EF}\u{1F1F5}", korea: "\u{1F1F0}\u{1F1F7}", uk: "\u{1F1EC}\u{1F1E7}",
  india: "\u{1F1EE}\u{1F1F3}", canada: "\u{1F1E8}\u{1F1E6}", mexico: "\u{1F1F2}\u{1F1FD}",
  brazil: "\u{1F1E7}\u{1F1F7}", australia: "\u{1F1E6}\u{1F1FA}", vietnam: "\u{1F1FB}\u{1F1F3}",
  thailand: "\u{1F1F9}\u{1F1ED}", taiwan: "\u{1F1F9}\u{1F1FC}", indonesia: "\u{1F1EE}\u{1F1E9}",
  turkey: "\u{1F1F9}\u{1F1F7}", singapore: "\u{1F1F8}\u{1F1EC}", uae: "\u{1F1E6}\u{1F1EA}",
  "saudi-arabia": "\u{1F1F8}\u{1F1E6}", "south-africa": "\u{1F1FF}\u{1F1E6}",
};

export default async function CountryTariffPage({ params }: Props) {
  const { country, slug } = await params;
  const countryData = getCountryBySlug(country);
  if (!countryData) notFound();

  const code = getCodeBySlug(slug);
  if (!code) notFound();

  const tariff = getCountryTariffBySlug(country, slug);
  if (!tariff) notFound();

  const allCountryRates = getAllCountryTariffsForCode(code.hscode);
  const related = getRelatedCodes(code.hscode, 6);
  const docs = code.chapter ? getRequiredDocs(code.chapter) : null;
  const countries = getAllCountries();
  const flag = FLAG[country] || "";

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: `${flag} ${countryData.name} Tariffs`, url: `/import/${country}` },
    { name: `HS ${formatHSCode(code.hscode)}`, url: `/import/${country}/${slug}` },
  ];

  const faqs = [
    {
      question: `What is the import duty for HS ${formatHSCode(code.hscode)} in ${countryData.name}?`,
      answer: `The MFN (Most Favored Nation) tariff rate for importing ${code.description} (HS ${formatHSCode(code.hscode)}) into ${countryData.name} is ${tariff.mfn_rate}%.${tariff.fta_rate !== null ? ` Under the ${tariff.fta_name}, a preferential rate of ${tariff.fta_rate}% may apply.` : ""}`,
    },
    {
      question: `Does ${countryData.name} have any FTA that reduces tariffs on HS ${formatHSCode(code.hscode)}?`,
      answer: tariff.fta_name
        ? `Yes. Under the ${tariff.fta_name}, the tariff may be reduced from ${tariff.mfn_rate}% to ${tariff.fta_rate}%. A valid Certificate of Origin is required.`
        : `No preferential FTA rate is currently available for this product in ${countryData.name}. The standard MFN rate of ${tariff.mfn_rate}% applies.`,
    },
    {
      question: `Which country has the lowest tariff for HS ${formatHSCode(code.hscode)}?`,
      answer: allCountryRates.length > 0
        ? `Among major trading nations, ${allCountryRates[0].country_name} has the lowest MFN rate at ${allCountryRates[0].mfn_rate}% for this product.`
        : "Rate comparison data is not available.",
    },
    {
      question: `What documents are needed to import HS ${formatHSCode(code.hscode)} into ${countryData.name}?`,
      answer: `Typical import documents include a Commercial Invoice, Packing List, Bill of Lading, Certificate of Origin, and customs declaration forms. Product-specific requirements (e.g., health certificates, safety standards) may apply depending on the product category.`,
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

      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold">
          {flag} {countryData.name} Import Tariff: HS {formatHSCode(code.hscode)}
        </h1>
      </div>
      <p className="text-lg text-slate-700 mb-6">{code.description}</p>

      {/* Tariff Rate Card */}
      <section className="mb-8">
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="bg-indigo-600 text-white p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">MFN Tariff Rate</span>
              <span className="text-3xl font-bold">{tariff.mfn_rate}%</span>
            </div>
          </div>
          {tariff.fta_rate !== null && tariff.fta_name && (
            <div className="bg-green-50 border-b border-green-200 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-green-800">FTA Rate ({tariff.fta_name})</span>
                  <p className="text-xs text-green-600 mt-1">Preferential rate with Certificate of Origin</p>
                </div>
                <span className="text-2xl font-bold text-green-700">{tariff.fta_rate}%</span>
              </div>
              <div className="mt-2 text-sm text-green-700">
                Savings: {(tariff.mfn_rate - tariff.fta_rate).toFixed(1)} percentage points
              </div>
            </div>
          )}
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">HS Code</span>
              <a href={`/code/${code.slug}`} className="font-mono text-indigo-600 hover:underline">
                {formatHSCode(code.hscode)}
              </a>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Product</span>
              <span className="text-right max-w-[60%]">{code.description}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Classification Level</span>
              <span>{levelLabel(code.level)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Importing Country</span>
              <span>{flag} {countryData.name}</span>
            </div>
          </div>
          {tariff.notes && (
            <div className="bg-amber-50 border-t border-amber-200 p-3">
              <p className="text-sm text-amber-800">{tariff.notes}</p>
            </div>
          )}
        </div>
      </section>

      {/* Country Comparison Table */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Tariff Rate Comparison by Country</h2>
        <p className="text-sm text-slate-500 mb-4">
          Compare import duty rates for HS {formatHSCode(code.hscode)} across major trading nations.
        </p>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 font-medium">Country</th>
                <th className="text-right p-3 font-medium">MFN Rate</th>
                <th className="text-right p-3 font-medium">FTA Rate</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">FTA</th>
              </tr>
            </thead>
            <tbody>
              {allCountryRates.map((r, i) => (
                <tr
                  key={r.country_code}
                  className={`border-t border-slate-100 ${r.country_slug === country ? "bg-indigo-50 font-medium" : i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                >
                  <td className="p-3">
                    <a href={`/import/${r.country_slug}/${slug}`} className="hover:underline text-indigo-600">
                      {FLAG[r.country_slug] || ""} {r.country_name}
                    </a>
                    {r.country_slug === country && <span className="text-xs ml-1 text-indigo-500">(current)</span>}
                  </td>
                  <td className="text-right p-3">{r.mfn_rate}%</td>
                  <td className="text-right p-3 text-green-700">{r.fta_rate !== null ? `${r.fta_rate}%` : "—"}</td>
                  <td className="p-3 text-slate-500 hidden sm:table-cell">{r.fta_name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AdSlot id="import-mid" />

      {/* Required Documents */}
      {docs && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Import Documents for {countryData.name}</h2>
          <p className="text-sm text-slate-500 mb-4">
            Typical documents required when importing HS {formatHSCode(code.hscode)} products.
          </p>
          <div className="space-y-2">
            {docs.universal.slice(0, 4).map((doc, i) => (
              <div key={i} className="p-3 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-sm">&#x2611;</span>
                  <span className="font-medium text-sm">{doc.name}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 ml-6">{doc.description}</p>
              </div>
            ))}
            {docs.specific.length > 0 && docs.specific.slice(0, 3).map((doc, i) => (
              <div key={`s-${i}`} className="p-3 border border-amber-200 rounded-lg bg-amber-50/30">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 text-sm">{doc.required ? "\u26A0\uFE0F" : "\u{1F4CB}"}</span>
                  <span className="font-medium text-sm">{doc.name}</span>
                  <span className="text-xs ml-auto">{doc.required ? <span className="text-red-600">Required</span> : <span className="text-amber-600">May apply</span>}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related HS Codes in this country */}
      {related.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Related HS Codes in {countryData.name}</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {related.map((r) => (
              <a
                key={r.hscode}
                href={`/import/${country}/${r.slug}`}
                className="p-3 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
              >
                <span className="font-mono text-indigo-600 text-sm">{formatHSCode(r.hscode)}</span>
                <span className="text-sm text-slate-600 ml-2">{r.description.substring(0, 50)}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Browse Other Countries */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">View This Tariff in Other Countries</h2>
        <div className="flex flex-wrap gap-2">
          {countries.filter((c) => c.slug !== country).map((c) => (
            <a
              key={c.slug}
              href={`/import/${c.slug}/${slug}`}
              className="px-3 py-1.5 bg-slate-100 rounded-full text-sm hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
            >
              {FLAG[c.slug] || ""} {c.name}
            </a>
          ))}
        </div>
      </section>

      {/* High-CPC Keywords Section */}
      <section className="mb-8 p-6 bg-orange-50 rounded-xl border border-orange-100">
        <h3 className="text-lg font-semibold text-orange-900 mb-3">
          Import {code.description} into {countryData.name}
        </h3>
        <p className="text-orange-800 text-sm leading-relaxed">
          Looking to import products under HS {formatHSCode(code.hscode)} into {countryData.name}?
          Compare customs broker fees, freight forwarding rates, and trade compliance solutions.
          Get cargo insurance quotes and optimize your international supply chain for {countryData.name} imports.
        </p>
      </section>

      {/* Link to main code page */}
      <section className="mb-8 bg-indigo-50 border border-indigo-100 rounded-lg p-5">
        <h2 className="text-lg font-bold mb-2">Full HS Code Details</h2>
        <p className="text-sm text-slate-600 mb-3">
          See complete classification details, all sub-codes, and global trade context for HS {formatHSCode(code.hscode)}.
        </p>
        <a
          href={`/code/${code.slug}`}
          className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          View HS {formatHSCode(code.hscode)} Full Details &rarr;
        </a>
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
        Tariff rates are approximate estimates based on published MFN schedules. Actual rates may vary.
        Always verify with the official customs authority of {countryData.name} before making business decisions.
      </p>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }} />
    </div>
  );
}
