import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCodeComparisonBySlug, getCodeBySlug, getAllCodeComparisonSlugs } from "@/lib/db";
import { AdSlot } from "@/components/AdSlot";
import { ComparisonBar } from "@/components/ComparisonBar";
import { FreshnessTag } from "@/components/FreshnessTag";

interface Props { params: Promise<{ slug: string }> }

export const dynamicParams = true;
export const revalidate = false;

export async function generateStaticParams() {
  return getAllCodeComparisonSlugs(500).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const comp = getCodeComparisonBySlug(slug);
  if (!comp) return {};
  const a = getCodeBySlug(comp.code_a);
  const b = getCodeBySlug(comp.code_b);
  if (!a || !b) return {};
  return {
    title: `${a.description} vs ${b.description} - Tariff & Duty Rate Comparison`,
    description: `Compare tariff rates: ${a.description} (${a.us_avg_duty ?? 'N/A'}% duty) vs ${b.description} (${b.us_avg_duty ?? 'N/A'}% duty). HS Code ${a.hscode} vs ${b.hscode}.`,
    alternates: { canonical: `/compare/${slug}` },
  };
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const comp = getCodeComparisonBySlug(slug);
  if (!comp) notFound();

  const a = getCodeBySlug(comp.code_a);
  const b = getCodeBySlug(comp.code_b);
  if (!a || !b) notFound();

  const metrics = [
    { label: "HS Code", a: a.hscode, b: b.hscode },
    { label: "Description", a: a.description, b: b.description },
    { label: "Avg US Duty Rate", a: a.us_avg_duty ? `${a.us_avg_duty}%` : "N/A", b: b.us_avg_duty ? `${b.us_avg_duty}%` : "N/A" },
    { label: "Duty Range", a: a.us_duty_range || "N/A", b: b.us_duty_range || "N/A" },
    { label: "Section", a: a.section || "N/A", b: b.section || "N/A" },
    { label: "Chapter", a: a.chapter || "N/A", b: b.chapter || "N/A" },
  ];

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-indigo-700 mb-2">
          Tariff Comparison: {a.hscode} vs {b.hscode}
        </h1>
        <p className="text-slate-600">{a.description} vs {b.description}</p>
        <FreshnessTag source="US International Trade Commission" />
      </header>

      <AdSlot id="top" />

      <div className="grid grid-cols-2 gap-4 mb-8">
        <a href={`/code/${a.slug}/`} className="block p-4 bg-indigo-50 rounded-lg text-center hover:shadow-md transition-shadow">
          <div className="font-bold text-indigo-700">{a.hscode}</div>
          <div className="text-sm text-slate-600 mt-1">{a.description}</div>
        </a>
        <a href={`/code/${b.slug}/`} className="block p-4 bg-blue-50 rounded-lg text-center hover:shadow-md transition-shadow">
          <div className="font-bold text-blue-700">{b.hscode}</div>
          <div className="text-sm text-slate-600 mt-1">{b.description}</div>
        </a>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden mb-8">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50">
            <th className="px-4 py-3 text-left font-semibold">Detail</th>
            <th className="px-4 py-3 text-right font-semibold text-indigo-700">{a.hscode}</th>
            <th className="px-4 py-3 text-right font-semibold text-blue-700">{b.hscode}</th>
          </tr></thead>
          <tbody>
            {metrics.map((m, i) => (
              <tr key={m.label} className={i % 2 === 0 ? "" : "bg-slate-50/50"}>
                <td className="px-4 py-2 font-medium">{m.label}</td>
                <td className="px-4 py-2 text-right">{m.a}</td>
                <td className="px-4 py-2 text-right">{m.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(a.us_avg_duty != null || b.us_avg_duty != null) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", margin: "24px 0" }}>
          <div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">Average US Duty Rate</h3>
            <ComparisonBar
              bars={[
                ...(a.us_avg_duty != null ? [{ label: a.hscode, value: a.us_avg_duty }] : []),
                ...(b.us_avg_duty != null ? [{ label: b.hscode, value: b.us_avg_duty }] : []),
              ]}
              format={(v) => v + "%"}
            />
          </div>
        </div>
      )}

      <AdSlot id="bottom" />
    </article>
  );
}
