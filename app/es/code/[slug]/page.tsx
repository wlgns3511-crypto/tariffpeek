import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCodeBySlug, getTopCodes, getChildCodes, getRelatedCodes, getSectionById } from "@/lib/db";
import { formatHSCode, levelLabel } from "@/lib/format";
import { analyzeHSCode } from "@/lib/tariff-analysis";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { AdSlot } from "@/components/AdSlot";

const SITE_URL = "https://tariffpeek.com";

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = false;
export const revalidate = false;

export async function generateStaticParams() {
  return getTopCodes(300).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const code = getCodeBySlug(slug);
  if (!code) return {};
  return {
    title: `Código HS ${formatHSCode(code.hscode)} — ${code.description} | Arancel`,
    description: `Código HS ${formatHSCode(code.hscode)}: ${code.description}. ${code.us_avg_duty ? `Tasa arancelaria EE.UU.: ${code.us_avg_duty}%.` : ""} Búsqueda de clasificación arancelaria para comercio internacional.`,
    alternates: {
      canonical: `${SITE_URL}/es/code/${slug}/`,
      languages: { en: `${SITE_URL}/code/${slug}/`, es: `${SITE_URL}/es/code/${slug}/` },
    },
    openGraph: { url: `/es/code/${slug}` },
  };
}

export default async function EsCodePage({ params }: Props) {
  const { slug } = await params;
  const code = getCodeBySlug(slug);
  if (!code) notFound();
  const t = await getDictionary("es");

  const section = code.section ? getSectionById(code.section) : undefined;
  const children = getChildCodes(code.hscode);
  const related = getRelatedCodes(code.hscode, 8);
  const analysis = analyzeHSCode(code, section);

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/es/" className="hover:underline">Inicio</a> / <span className="text-slate-800">HS {formatHSCode(code.hscode)}</span>
      </nav>

      <div className="mb-4">
        <a href={`/code/${slug}`} className="text-indigo-600 hover:underline text-sm">{t.viewInEnglish}</a>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-bold">{t.hsCode} {formatHSCode(code.hscode)}</h1>
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

      {/* Classification Details */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">{t.classificationDetails}</h2>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="flex justify-between p-3 border-b border-slate-100 bg-slate-50">
            <span className="text-sm font-medium">{t.hsCode}</span>
            <span className="text-sm font-mono font-bold text-indigo-600">{formatHSCode(code.hscode)}</span>
          </div>
          <div className="flex justify-between p-3 border-b border-slate-100">
            <span className="text-sm font-medium">Descripci&oacute;n</span>
            <span className="text-sm text-right max-w-[60%]">{code.description}</span>
          </div>
          <div className="flex justify-between p-3 border-b border-slate-100 bg-slate-50">
            <span className="text-sm font-medium">Nivel</span>
            <span className="text-sm">{levelLabel(code.level)} ({code.level} d&iacute;gitos)</span>
          </div>
          {section && (
            <div className="flex justify-between p-3">
              <span className="text-sm font-medium">Secci&oacute;n</span>
              <span className="text-sm">{section.id} &mdash; {section.name}</span>
            </div>
          )}
        </div>
      </section>

      {/* US Import Duty */}
      {code.us_avg_duty !== null && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">{t.usImportDuty}</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="flex justify-between p-3 border-b border-slate-100 bg-red-50">
              <span className="text-sm font-medium">{t.avgDutyRate}</span>
              <span className="text-lg font-bold text-red-700">{code.us_avg_duty}%</span>
            </div>
            {code.us_duty_range && (
              <div className="flex justify-between p-3">
                <span className="text-sm font-medium">Rango</span>
                <span className="text-sm font-semibold">{code.us_duty_range}</span>
              </div>
            )}
          </div>
        </section>
      )}

      <AdSlot id="code-mid" />

      {/* Classification Guide */}
      <section className="mb-8">
        <h2 className="text-xl font-bold mb-3">{t.classificationGuide}</h2>
        <div className="bg-amber-50 border-l-4 border-amber-300 p-4 rounded-r-lg">
          <p className="text-slate-700 text-sm">{analysis.classificationTip}</p>
        </div>
      </section>

      {/* Sub-Classifications */}
      {children.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">{t.subClassifications}</h2>
          <div className="space-y-1">
            {children.map((ch) => (
              <a key={ch.hscode} href={`/es/code/${ch.slug}`} className="flex items-center gap-3 p-3 border border-slate-100 rounded-lg hover:border-indigo-200 hover:bg-indigo-50 transition-colors">
                <span className="font-mono text-indigo-600 text-sm w-20">{formatHSCode(ch.hscode)}</span>
                <span className="text-sm text-slate-700 flex-1">{ch.description}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Related Codes */}
      {related.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">{t.relatedCodes}</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {related.map((r) => (
              <a key={r.hscode} href={`/es/code/${r.slug}`} className="p-3 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                <span className="font-mono text-indigo-600 text-sm">{formatHSCode(r.hscode)}</span>
                <span className="text-sm text-slate-600 ml-2">{r.description.substring(0, 60)}</span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
