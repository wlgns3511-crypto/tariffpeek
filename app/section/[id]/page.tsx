import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllSections, getSectionById, getCodesBySection } from "@/lib/db";
import { formatHSCode, levelLabel } from "@/lib/format";
import { breadcrumbSchema } from "@/lib/schema";

interface Props { params: Promise<{ id: string }> }

export async function generateStaticParams() {
  return getAllSections().map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const section = getSectionById(id);
  if (!section) return {};
  return {
    title: `Section ${section.id} — ${section.name}`,
    description: `HS Code Section ${section.id}: ${section.name}. Covers chapters ${section.chapter_range}. Browse all chapter codes and classifications.`,
    alternates: { canonical: `/section/${id}` },
  };
}

export default async function SectionPage({ params }: Props) {
  const { id } = await params;
  const section = getSectionById(id);
  if (!section) notFound();

  const chapters = getCodesBySection(id);

  return (
    <div>
      <nav className="text-sm text-slate-500 mb-4">
        <a href="/" className="hover:underline">Home</a> / <span className="text-slate-800">Section {section.id}</span>
      </nav>

      <h1 className="text-3xl font-bold mb-2">Section {section.id}: {section.name}</h1>
      <p className="text-slate-600 mb-8">Chapters {section.chapter_range} of the Harmonized System</p>

      <section>
        <h2 className="text-xl font-bold mb-4">Chapters in This Section</h2>
        <div className="space-y-2">
          {chapters.map((ch) => (
            <a key={ch.hscode} href={`/code/${ch.slug}`} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
              <span className="font-mono text-indigo-600 font-bold w-12">Ch. {ch.hscode}</span>
              <span className="text-slate-700 flex-1">{ch.description}</span>
              <span className="text-slate-400">→</span>
            </a>
          ))}
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema([
        { name: "Home", url: "/" },
        { name: `Section ${section.id}`, url: `/section/${id}` },
      ])) }} />
    </div>
  );
}
