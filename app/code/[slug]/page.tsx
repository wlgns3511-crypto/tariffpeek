import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCodeBySlug, getTopCodes, getChildCodes, getRelatedCodes, getSectionById, getGlobalAvgDuty, getChapterAvgDuty, getDutyRank, getAllCountryTariffsForCode } from "@/lib/db";
import { InsightCards } from "@/components/InsightCards";
import { formatHSCode, levelLabel } from "@/lib/format";
import { breadcrumbSchema, faqSchema, datasetSchema } from "@/lib/schema";
import { analyzeHSCode } from "@/lib/tariff-analysis";
import { getRequiredDocs } from "@/lib/documents";
import { AdSlot } from "@/components/AdSlot";
import { DataFeedback } from "@/components/DataFeedback";
import { EmbedButton } from "@/components/EmbedButton";
import { FreshnessTag } from "@/components/FreshnessTag";
import { LandedCostCalculator } from "@/components/LandedCostCalculator";
import { CiteButton } from "@/components/CiteButton";
import { AuthorBox } from "@/components/AuthorBox";

interface Props { params: Promise<{ slug: string }> }

function hsCodeFromSlug(slug: string): string | null {
  return slug.match(/^(\d{2,10})/)?.[1] ?? null;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return getTopCodes(3000).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hsCode = hsCodeFromSlug(slug);
  const formattedHsCode = hsCode ? formatHSCode(hsCode) : slug;
  const description = `Lookup tariff classification, customs notes, and import duty benchmarks for HS ${formattedHsCode}.`;
  return {
    title: `HS Code ${formattedHsCode} — Import Duty Rate & Tariff Classification`,
    description,
    alternates: { canonical: `/code/${slug}` },
    openGraph: { url: `/code/${slug}` },
  };
}

export default async function CodePage({ params }: Props) {
  const { slug } = await params;
  const code = getCodeBySlug(slug);
  if (!code) notFound();

  const section = code.section ? getSectionById(code.section) : undefined;
  const children = getChildCodes(code.hscode);
  const related = getRelatedCodes(code.hscode, 8);
  const analysis = analyzeHSCode(code, section);
  const docs = code.chapter ? getRequiredDocs(code.chapter) : null;

  const breadcrumbs = [
    { name: "Home", url: "/" },
    ...(section ? [{ name: `Section ${section.id}`, url: `/section/${section.id}` }] : []),
    { name: `HS ${formatHSCode(code.hscode)}`, url: `/code/${slug}` },
  ];

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        {breadcrumbs.map((b, i) => (
          <span key={i}>{i > 0 && " / "}{i < breadcrumbs.length - 1 ? <a href={b.url} className="hover:underline">{b.name}</a> : <span className="text-slate-800">{b.name}</span>}</span>
        ))}
      </nav>

      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold">HS {formatHSCode(code.hscode)}</h1>
        <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
          {levelLabel(code.level)}
        </span>
      </div>
      <p className="text-lg text-slate-700 mb-6">{code.description}</p>

      {/* Summary */}
      <section className="mb-6">
        <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
          <p className="text-slate-700 text-sm">{analysis.summary}</p>
        </div>
      </section>

      {/* Tariff Insights */}
      {code.us_avg_duty !== null && (() => {
        const globalAvg = getGlobalAvgDuty();
        const chapterAvg = code.chapter ? getChapterAvgDuty(code.chapter) : globalAvg;
        const { rank, total } = getDutyRank(code.us_avg_duty);
        return (
          <InsightCards
            dutyRate={code.us_avg_duty}
            globalAvg={globalAvg}
            chapterAvg={chapterAvg}
            chapter={code.chapter}
            rank={rank}
            total={total}
            hasFta={!!code.us_fta_notes}
          />
        );
      })()}

      {/* Code Details */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Classification Details</h2>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="flex justify-between p-3 border-b border-slate-100 bg-slate-50">
            <span className="text-sm font-medium">HS Code</span>
            <span className="text-sm font-mono font-bold text-indigo-600">{formatHSCode(code.hscode)}</span>
          </div>
          <div className="flex justify-between p-3 border-b border-slate-100">
            <span className="text-sm font-medium">Description</span>
            <span className="text-sm text-right max-w-[60%]">{code.description}</span>
          </div>
          <div className="flex justify-between p-3 border-b border-slate-100 bg-slate-50">
            <span className="text-sm font-medium">Level</span>
            <span className="text-sm">{levelLabel(code.level)} ({code.level}-digit)</span>
          </div>
          {section && (
            <div className="flex justify-between p-3 border-b border-slate-100">
              <span className="text-sm font-medium">Section</span>
              <a href={`/section/${section.id}`} className="text-sm text-indigo-600 hover:underline">{section.id} — {section.name}</a>
            </div>
          )}
          {code.chapter && (
            <div className="flex justify-between p-3 bg-slate-50">
              <span className="text-sm font-medium">Chapter</span>
              <span className="text-sm">{code.chapter}</span>
            </div>
          )}
        </div>
      </section>

      {/* US Tariff Information */}
      {code.us_avg_duty !== null && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">🇺🇸 US Import Duty</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="flex justify-between p-3 border-b border-slate-100 bg-red-50">
              <span className="text-sm font-medium">Average Duty Rate</span>
              <span className="text-lg font-bold text-red-700">{code.us_avg_duty}%</span>
            </div>
            {code.us_duty_range && (
              <div className="flex justify-between p-3 border-b border-slate-100">
                <span className="text-sm font-medium">Duty Range</span>
                <span className="text-sm font-semibold">{code.us_duty_range}</span>
              </div>
            )}
            {code.us_duty_notes && (
              <div className="p-3 border-b border-slate-100 bg-slate-50">
                <span className="text-sm font-medium block mb-1">Notes</span>
                <span className="text-sm text-slate-600">{code.us_duty_notes}</span>
              </div>
            )}
            {code.us_fta_notes && (
              <div className="p-3">
                <span className="text-sm font-medium block mb-1">Free Trade Agreements</span>
                <span className="text-sm text-green-700">{code.us_fta_notes}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Rates are approximate and based on MFN (Most Favored Nation) tariffs. Actual rates may vary by specific product classification.
            Always verify with <a href="https://hts.usitc.gov" className="underline" target="_blank" rel="noopener">USITC</a> for official rates.
          </p>
        </section>
      )}

      {/* Landed Cost Calculator */}
      {code.us_avg_duty !== null && (
        <LandedCostCalculator defaultTariffRate={code.us_avg_duty} hsCode={formatHSCode(code.hscode)} />
      )}

      {/* Classification Tip */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">Classification Guide</h2>
        <div className="bg-amber-50 border-l-4 border-amber-300 p-4 rounded-r-lg">
          <p className="text-slate-700 text-sm">{analysis.classificationTip}</p>
        </div>
      </section>

      {/* Trade Context */}
      {analysis.sectionOverview && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Trade Context</h2>
          <p className="text-slate-700 text-sm mb-3">{analysis.sectionOverview}</p>
          {analysis.tradeNote && (
            <div className="bg-sky-50 border-l-4 border-sky-300 p-3 rounded-r-lg">
              <p className="font-medium text-sky-800 text-xs mb-1">Regulatory Note</p>
              <p className="text-slate-700 text-sm">{analysis.tradeNote}</p>
            </div>
          )}
        </section>
      )}

      {/* Required Documents Checklist */}
      {docs && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">🇺🇸 US Import Document Checklist</h2>
          <p className="text-sm text-slate-500 mb-4">Documents required when importing products under HS {formatHSCode(code.hscode)} into the United States.</p>

          {/* Universal docs */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Required for All Imports</h3>
            <div className="space-y-2">
              {docs.universal.map((doc, i) => (
                <details key={i} className="border border-slate-200 rounded-lg">
                  <summary className="p-3 cursor-pointer hover:bg-slate-50 flex items-center gap-2">
                    <span className="text-green-500">☑</span>
                    <span className="font-medium text-sm">{doc.name}</span>
                    <span className="text-xs text-slate-400 ml-auto">{doc.agency}</span>
                  </summary>
                  <div className="px-3 pb-3 text-sm text-slate-600 ml-7">{doc.description}</div>
                </details>
              ))}
            </div>
          </div>

          {/* Chapter-specific docs */}
          {docs.specific.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-red-600 mb-2 uppercase tracking-wide">Product-Specific Requirements</h3>
              <div className="space-y-2">
                {docs.specific.map((doc, i) => (
                  <details key={i} className="border border-red-200 rounded-lg bg-red-50/30" open={i === 0}>
                    <summary className="p-3 cursor-pointer hover:bg-red-50 flex items-center gap-2">
                      <span className={doc.required ? "text-red-500" : "text-amber-500"}>{doc.required ? "⚠️" : "📋"}</span>
                      <span className="font-medium text-sm">{doc.name}</span>
                      <span className="text-xs ml-auto">{doc.required ? <span className="text-red-600 font-medium">Required</span> : <span className="text-amber-600">May be required</span>}</span>
                    </summary>
                    <div className="px-3 pb-3 text-sm text-slate-600 ml-7">
                      <p>{doc.description}</p>
                      <p className="text-xs text-slate-400 mt-1">Agency: {doc.agency}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* FTA Certificates */}
          {docs.ftaInfo.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-green-600 mb-2 uppercase tracking-wide">FTA Certificate of Origin (for preferential rates)</h3>
              <div className="space-y-1">
                {docs.ftaInfo.map((fta, i) => (
                  <div key={i} className="p-2 bg-green-50 rounded text-sm text-slate-700">
                    <span className="text-green-600 mr-2">🤝</span>{fta}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-4">
            This checklist is for general guidance only. Actual requirements may vary based on specific product, country of origin, and current regulations.
            Always consult with a licensed customs broker or the relevant agency for official requirements.
          </p>
        </section>
      )}

      <AdSlot id="code-mid" />

      {/* Child Codes */}
      {children.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Sub-Classifications</h2>
          <div className="space-y-1">
            {children.map((ch) => (
              <a key={ch.hscode} href={`/code/${ch.slug}/`} className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
                <span className="font-mono text-indigo-600 text-sm w-20">{formatHSCode(ch.hscode)}</span>
                <span className="text-sm text-slate-700 flex-1">{ch.description}</span>
                <span className="text-xs text-slate-400">{levelLabel(ch.level)}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Related Codes */}
      {related.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Related HS Codes</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {related.map((r) => (
              <a key={r.hscode} href={`/code/${r.slug}/`} className="p-3 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                <span className="font-mono text-indigo-600 text-sm">{formatHSCode(r.hscode)}</span>
                <span className="text-sm text-slate-600 ml-2">{r.description.substring(0, 60)}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Compare Tariff Rates */}
      {related.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Compare Tariff Rates</h2>
          <p className="text-sm text-slate-500 mb-3">See how HS {formatHSCode(code.hscode)} compares with related codes in the same chapter.</p>
          <div className="flex flex-wrap gap-2">
            {related.slice(0, 6).map((r) => {
              const [a, b] = [code.slug, r.slug].sort();
              return (
                <a key={r.hscode} href={`/compare/${a}-vs-${b}/`}
                  className="px-4 py-2 border border-indigo-200 rounded-full text-sm hover:bg-indigo-50 hover:border-indigo-400 text-indigo-700 font-medium transition-colors">
                  {formatHSCode(code.hscode)} vs {formatHSCode(r.hscode)}
                </a>
              );
            })}
          </div>
        </section>
      )}

      {/* Country Tariff Rates for This Code */}
      {(() => {
        const countryTariffs = getAllCountryTariffsForCode(code.hscode).slice(0, 8);
        if (countryTariffs.length === 0) return null;
        return (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-3">Import Duty by Country</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {countryTariffs.map(ct => (
                <a key={ct.country_slug} href={`/import/${ct.country_slug}/${code.slug}/`}
                  className="block p-3 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-sm text-center">
                  <span className="font-medium text-indigo-700">{ct.country_name}</span>
                  <span className="block text-xs text-slate-500 mt-1">MFN: {ct.mfn_rate}%{ct.fta_rate != null ? ` / FTA: ${ct.fta_rate}%` : ''}</span>
                </a>
              ))}
            </div>
          </section>
        );
      })()}

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 my-6 text-sm">
        <p className="text-slate-600">
          <strong>Related:</strong> Shipping this item? Get rates at <a href="https://shipcalcwize.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">ShipCalcWize</a> for 15,000+ international routes.
        </p>
      </div>

      {/* Related Data Resources */}
      <section className="mb-8 p-4 bg-slate-50 rounded-lg">
        <h3 className="text-sm font-semibold text-slate-500 mb-2">Related Data Resources</h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <a href="https://shipcalcwize.com" className="text-indigo-600 hover:underline">ShipCalcWize - Shipping cost calculator &rarr;</a>
          <a href="https://calcpeek.com" className="text-indigo-600 hover:underline">CalcPeek - Unit converters &rarr;</a>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        {analysis.faqs.map((faq, i) => (
          <details key={i} className="border border-slate-200 rounded-lg mb-2" open={i === 0}>
            <summary className="p-4 cursor-pointer font-medium hover:bg-slate-50">{faq.question}</summary>
            <div className="px-4 pb-4 text-slate-600">{faq.answer}</div>
          </details>
        ))}
      </section>

      <FreshnessTag source="UN Comtrade & USITC" />

      <div className="flex items-center gap-4 mt-4">
        <CiteButton title={`HS Code ${formatHSCode(code.hscode)} - ${code.description}`} url={`https://tariffpeek.com/code/${slug}`} source="TariffPeek (WCO Data)" />
      </div>

          <EmbedButton url="https://tariffpeek.com" title="Data from TariffPeek" site="TariffPeek" siteUrl="https://tariffpeek.com" />

          <DataFeedback />

          <section className="mt-8 p-6 bg-orange-50 rounded-xl border border-orange-100">
        <h3 className="text-lg font-semibold text-orange-900 mb-3">Need Import/Export Assistance?</h3>
        <p className="text-orange-800 text-sm leading-relaxed">
          Find licensed customs brokers and freight forwarding services for this HS code.
          Compare trade compliance solutions, cargo insurance quotes, and international shipping rates to optimize your supply chain costs.
        </p>
      </section>

      <AuthorBox />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(analysis.faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema(`HS Code ${formatHSCode(code.hscode)}`, code.description)) }} />
    </div>
  );
}
