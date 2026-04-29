import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getChapters, getCodeBySlug, getChildCodes, getRelatedCodes, getSectionById, getGlobalAvgDuty, getChapterAvgDuty, getDutyRank, getDutyPeers, getAllCountryTariffsForCode } from "@/lib/db";
import { InsightCards } from "@/components/InsightCards";
import { InsightBlock } from "@/components/upgrades/InsightBlock";
import { getTariffInsights } from "@/lib/insights";
import { formatHSCode, levelLabel } from "@/lib/format";
import { breadcrumbSchema, faqSchema, datasetSchema } from "@/lib/schema";
import { analyzeHSCode } from "@/lib/tariff-analysis";
import { generateAutoFAQs } from "@/lib/auto-faqs";
import { getRequiredDocs } from "@/lib/documents";
import { AdSlot } from "@/components/AdSlot";
import { DataFeedback } from "@/components/DataFeedback";
import { EmbedButton } from "@/components/EmbedButton";
import { FreshnessTag } from "@/components/FreshnessTag";
import { LandedCostCalculator } from "@/components/LandedCostCalculator";
import { DutyCalculator } from "@/components/tools/DutyCalculator";
import { CiteButton } from "@/components/CiteButton";
import { AuthorBox } from "@/components/AuthorBox";
import { AnswerHero } from "@/components/upgrades/AnswerHero";
import { TrustBlock } from "@/components/upgrades/TrustBlock";
import { DecisionNext } from "@/components/upgrades/DecisionNext";
import { RelatedEntities } from '@/components/upgrades/RelatedEntities';
import { FeedbackButton } from "@/components/FeedbackButton";
import { TableOfContents } from '@/components/upgrades/TableOfContents';

interface Props { params: Promise<{ slug: string }> }

function hsCodeFromSlug(slug: string): string | null {
  return slug.match(/^(\d{2,10})/)?.[1] ?? null;
}

export const dynamicParams = false;
export const revalidate = 86400;

// HCU 2026-04-24: /code/ keep-set is now level=2 chapters only (97).
// Level=4 headings (1,229) + level=6 leaves (5,613) were thin programmatic
// pages — GSC 1-month data showed 0 clicks / almost-zero impressions on them.
// Those 6,842 URLs now 410 Gone via middleware so the crawl budget + E-E-A-T
// signal concentrates on the 97 real IA hubs + /import/[country]/[slug]/
// (the actual click-earning route).
export async function generateStaticParams() {
  return getChapters().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const hsCode = hsCodeFromSlug(slug);
  const formattedHsCode = hsCode ? formatHSCode(hsCode) : slug;
  const code = getCodeBySlug(slug);
  // RANKING pattern: rank by US avg duty rate (higher duty = higher rank).
  let title: string;
  let description: string;
  if (code && code.us_avg_duty != null && code.level >= 4) {
    const { rank, total } = getDutyRank(code.us_avg_duty);
    const peers = getDutyPeers(code.us_avg_duty, code.hscode);
    const chapterAvg = code.chapter ? getChapterAvgDuty(code.chapter) : getGlobalAvgDuty();
    const peerBits: string[] = [];
    if (peers.above && peers.above.us_avg_duty != null) {
      const p = getDutyRank(peers.above.us_avg_duty);
      peerBits.push(`HS ${formatHSCode(peers.above.hscode)} (#${p.rank})`);
    }
    if (peers.below && peers.below.us_avg_duty != null) {
      const p = getDutyRank(peers.below.us_avg_duty);
      peerBits.push(`HS ${formatHSCode(peers.below.hscode)} (#${p.rank})`);
    }
    const peerStr = peerBits.length ? ` Compare with ${peerBits.join(' and ')}.` : '';
    const shortDesc = code.description.length > 48 ? code.description.slice(0, 48) + '…' : code.description;
    title = `HS ${formattedHsCode}: #${rank} of ${total} US Duty · ${code.us_avg_duty.toFixed(1)}%`;
    description = `HS ${formattedHsCode} (${shortDesc}) ranks #${rank} of ${total} US tariff codes by duty rate (${code.us_avg_duty.toFixed(1)}%). Chapter avg ${chapterAvg.toFixed(1)}%.${peerStr} USITC data.`;
  } else if (code) {
    title = `HS ${formattedHsCode}: ${code.description.slice(0, 50)} · US Tariff`;
    description = `HS ${formattedHsCode} — ${code.description}. ${code.level >= 4 ? 'Duty rates' : 'Classification and subcategories'}, customs notes, and import benchmarks. USITC data.`;
  } else {
    title = `HS ${formattedHsCode}: Import Duty & Tariff Classification`;
    description = `Lookup tariff classification, customs notes, and import duty benchmarks for HS ${formattedHsCode}. USITC data.`;
  }
  return {
    title,
    description,
    alternates: { canonical: `/code/${slug}/` },
    openGraph: { title, description, url: `/code/${slug}/` },
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
  const globalAvgDuty = getGlobalAvgDuty();
  const chapterAvgDuty = code.chapter ? getChapterAvgDuty(code.chapter) : globalAvgDuty;
  const autoFaqs = generateAutoFAQs(code, globalAvgDuty, chapterAvgDuty, children.length, !!code.us_fta_notes);
  const allFaqs = [...analysis.faqs, ...autoFaqs];
  const docs = code.chapter ? getRequiredDocs(code.chapter) : null;

  const breadcrumbs = [
    { name: "Home", url: "/" },
    ...(section ? [{ name: `Section ${section.id}`, url: `/section/${section.id}/` }] : []),
    { name: `HS ${formatHSCode(code.hscode)}`, url: `/code/${slug}/` },
  ];

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        {breadcrumbs.map((b, i) => (
          <span key={i}>{i > 0 && " / "}{i < breadcrumbs.length - 1 ? <a href={b.url} className="hover:underline">{b.name}</a> : <span className="text-slate-800">{b.name}</span>}</span>
        ))}
      </nav>

      <AnswerHero
        title={`HS ${formatHSCode(code.hscode)}`}
        subtitle={code.description}
        tagline={`${analysis.summary}${code.us_avg_duty !== null ? ` US average duty rate: ${code.us_avg_duty.toFixed(2)}%.` : ""}${code.us_fta_notes ? " Free trade agreements may reduce or eliminate duty for qualifying origins." : ""}`}
        badges={[
          { label: levelLabel(code.level), tone: "indigo" as const },
          ...(section ? [{ label: `Section ${section.id}`, tone: "slate" as const }] : []),
          ...(code.us_avg_duty !== null ? [{ label: `${code.us_avg_duty.toFixed(2)}% duty`, tone: "amber" as const }] : []),
        ]}
        alternatives={related.slice(0, 3).map(r => ({
          label: `HS ${formatHSCode(r.hscode)}`,
          href: `/code/${r.slug}/`,
          sublabel: r.description?.substring(0, 30),
        }))}
        alternativesLabel="Related HS codes"
      />

      <TrustBlock
        sources={[
          { name: "WCO Harmonized System", url: "https://www.wcoomd.org/en/topics/nomenclature/overview.aspx" },
          { name: "USITC HTS", url: `https://hts.usitc.gov/?query=${code.hscode}/` },
          { name: "US CBP CROSS Rulings", url: "https://rulings.cbp.gov/" },
          { name: "USTR Free Trade Agreements", url: "https://ustr.gov/trade-agreements/free-trade-agreements" },
          { name: "Census USA Trade Online", url: "https://usatrade.census.gov/" },
        ]}
        updated={`HTS ${new Date().getFullYear()} edition, refreshed monthly`}
      />

      <TableOfContents />

      {/* Insight Block */}
      {code.us_avg_duty !== null && (() => {
        const globalAvgIB = getGlobalAvgDuty();
        const chapterAvgIB = code.chapter ? getChapterAvgDuty(code.chapter) : globalAvgIB;
        const rankIB = getDutyRank(code.us_avg_duty);
        return (
          <InsightBlock
            entityName={`HS ${formatHSCode(code.hscode)}`}
            insights={getTariffInsights(code, globalAvgIB, chapterAvgIB, rankIB.rank, rankIB.total, !!code.us_fta_notes)}
            heading="Key Takeaways"
          />
        );
      })()}

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

      {/* Import Duty Calculator */}
      {code.us_avg_duty !== null && (
        <DutyCalculator
          dutyRate={code.us_avg_duty}
          hasFta={!!code.us_fta_notes}
          hsCode={formatHSCode(code.hscode)}
          description={code.description}
        />
      )}

      {/* Landed Cost Calculator */}
      {code.us_avg_duty !== null && (
        <LandedCostCalculator defaultTariffRate={code.us_avg_duty} hsCode={formatHSCode(code.hscode)} />
      )}

      {/* By-FTA cross-link (HCU Tier S depth expansion 2026-04-21, chapter-level only) */}
      {code.level === 2 && (
        <section className="my-6">
          <a
            href={`/code/${slug}/by-fta/`}
            className="block rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 hover:border-emerald-400 hover:shadow-sm transition-all"
          >
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">
              FTA preference breakdown →
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              HS {formatHSCode(code.hscode)} by free-trade agreement: MFN vs preferential rates
            </h3>
            <p className="text-sm text-slate-600">
              See which FTA programs (USMCA, RCEP, EU CETA, KORUS…) cover this chapter,
              the average MFN-to-FTA gap per program, and which countries still charge MFN
              to every origin.
            </p>
          </a>
        </section>
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
                /* 2026-04-28 — link target redirect: /import/${country}/${slug}/ (noindex) → /import/${country}/ (indexable hub) */
                <a key={ct.country_slug} href={`/import/${ct.country_slug}/`}
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

      <RelatedEntities
        entityName={`HS ${formatHSCode(code.hscode)}`}
        heading={`Related HS codes`}
        statLabel="Duty rate"
        items={related.slice(0, 8).map(r => ({
          name: `HS ${formatHSCode(r.hscode)} — ${r.description.substring(0, 40)}`,
          href: `/code/${r.slug}/`,
          stat: r.us_avg_duty !== null ? `${r.us_avg_duty.toFixed(1)}%` : undefined,
        }))}
      />

      {/* FAQ */}
      <section className="mt-8">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        {allFaqs.map((faq, i) => (
          <details key={i} className="border border-slate-200 rounded-lg mb-2" open={i === 0}>
            <summary className="p-4 cursor-pointer font-medium hover:bg-slate-50">{faq.question}</summary>
            <div className="px-4 pb-4 text-slate-600">{faq.answer}</div>
          </details>
        ))}
      </section>

      {/* Why this matters — US importer / exporter context */}
      <section className="mb-8 mt-6" data-upgrade="why-it-matters">
        <h2 className="text-xl font-bold mb-3">
          Why HS {formatHSCode(code.hscode)} matters for your shipment
        </h2>
        <div className="rounded-lg border border-slate-200 bg-white p-5 text-slate-700 leading-relaxed space-y-3">
          <p>
            HS code classification is the single most important
            decision in any international trade transaction. The
            6-digit Harmonized System (HS) is set by the World Customs
            Organization and used by 200+ countries; the US extends it
            to 10 digits as the Harmonized Tariff Schedule (HTS). The
            HTS code determines: (1) the duty rate you pay, (2) which
            free trade agreements you can claim, (3) what import
            licenses or permits you need, and (4) whether your goods
            face anti-dumping or Section 301 tariffs.
          </p>
          <p>
            Misclassification is the #1 source of customs penalties.
            CBP regularly audits classifications and can apply 4
            years of back duties plus penalties (up to 4x the duty
            owed for negligence, 8x for fraud). The safe path is to
            request a binding ruling from CBP via the
            {" "}<a href="https://rulings.cbp.gov/" className="underline" target="_blank" rel="noopener noreferrer">CROSS database</a>
            for any product where the classification isn&apos;t
            obvious.
          </p>
          <p>
            For US importers, three concrete checks before any
            shipment: (1) confirm the 10-digit HTS code on the
            official{" "}
            <a href="https://hts.usitc.gov/" className="underline" target="_blank" rel="noopener noreferrer">USITC HTS database</a>
            , (2) check current Section 301 lists and any antidumping
            orders for the country of origin, and (3) verify whether
            an FTA preference (USMCA, KORUS, AUSFTA, etc.) applies and
            what certification it requires.
          </p>
          <p className="text-sm text-slate-500">
            Sources: WCO Harmonized System Nomenclature, USITC HTS
            (the legal US tariff schedule), CBP CROSS rulings
            database. Not affiliated with WCO, USITC, or CBP. For
            binding classification, request a CROSS ruling.
          </p>
        </div>
      </section>

      <DecisionNext
        cards={[
          {
            title: `Look up on USITC HTS`,
            blurb: `The official US legal tariff schedule. Always verify the 10-digit code here before filing.`,
            href: `https://hts.usitc.gov/?query=${code.hscode}`,
            cta: `Open USITC HTS`,
            tone: "indigo" as const,
          },
          {
            title: `Shipping costs to/from`,
            blurb: `Once you have the duty rate, layer in freight cost for the full landed-cost picture.`,
            href: `https://shipcalcwize.com`,
            cta: `Open ShipCalcWize`,
            tone: "emerald" as const,
          },
          {
            title: `CBP CROSS rulings`,
            blurb: `Search prior CBP classification rulings for similar products. The most authoritative US source for borderline cases.`,
            href: `https://rulings.cbp.gov/`,
            cta: `Open CBP CROSS`,
            tone: "amber" as const,
          },
        ]}
      />

      <FreshnessTag source="WCO HS Nomenclature + USITC HTS + CBP CROSS rulings + USTR FTA texts" />

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

      <FeedbackButton pageId={slug} />

      <AuthorBox />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      {allFaqs.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(allFaqs)) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema(`HS Code ${formatHSCode(code.hscode)}`, code.description)) }} />
    </div>
  );
}
