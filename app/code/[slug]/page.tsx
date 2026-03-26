import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCodeBySlug, getTopCodes, getChildCodes, getRelatedCodes, getSectionById } from "@/lib/db";
import { formatHSCode, levelLabel } from "@/lib/format";
import { breadcrumbSchema, faqSchema, datasetSchema } from "@/lib/schema";
import { analyzeHSCode } from "@/lib/tariff-analysis";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getTopCodes(3000).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const code = getCodeBySlug(slug);
  if (!code) return {};
  return {
    title: `HS Code ${formatHSCode(code.hscode)} — ${code.description}`,
    description: `HS Code ${formatHSCode(code.hscode)}: ${code.description}. Find classification details, related codes, and trade guidance for customs declaration.`,
    alternates: { canonical: `/code/${slug}` },
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

      {/* Child Codes */}
      {children.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">Sub-Classifications</h2>
          <div className="space-y-1">
            {children.map((ch) => (
              <a key={ch.hscode} href={`/code/${ch.slug}`} className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
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
              <a key={r.hscode} href={`/code/${r.slug}`} className="p-3 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                <span className="font-mono text-indigo-600 text-sm">{formatHSCode(r.hscode)}</span>
                <span className="text-sm text-slate-600 ml-2">{r.description.substring(0, 60)}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Cross-site links */}
      <section className="mb-8 bg-indigo-50 border border-indigo-100 rounded-lg p-5">
        <h2 className="text-lg font-bold mb-3">Related Data</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <a href="https://salarybycity.com" className="text-indigo-700 hover:underline">Salary Data by City →</a>
          <a href="https://costbycity.com" className="text-indigo-700 hover:underline">Cost of Living Data →</a>
          <a href="https://calcpeek.com" className="text-indigo-700 hover:underline">Unit Converters →</a>
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

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(breadcrumbs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(analysis.faqs)) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema(`HS Code ${formatHSCode(code.hscode)}`, code.description)) }} />
    </div>
  );
}
