import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllStates, getStateBySlug } from '@/lib/states-data';
import { breadcrumbSchema } from '@/lib/schema';
import { StateRich } from '@/components/state/StateRich';
import { buildStateFacts, getStateNarrative, stateStatusLabel } from '@/lib/state-facts';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;
export const revalidate = 86400;

export function generateStaticParams() {
  return getAllStates().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) return {};
  const facts = buildStateFacts(state);
  return {
    title: `${state.name} Trade: ${state.importVolume.replace(/ annually$/i, "")} Imports | ${state.majorPorts.length} Ports (2026)`,
    description: `${state.name} imports ${state.importVolume} and exports ${state.exportVolume} annually. ${facts.portCount} major port${facts.portCount > 1 ? "s" : ""} including ${state.majorPorts[0]}. Top partners: ${state.topTradePartners.slice(0, 3).join(", ")}. Top imports: ${state.topImports.slice(0, 3).join(", ")}.`,
    alternates: { canonical: `/state/${slug}/` },
    openGraph: {
      title: `${state.name} International Trade — ${state.importVolume} Imports`,
      description: `${state.name} trade data: ${facts.portCount} ports, ${state.topTradePartners.length} partners, ${facts.isExporter ? "net exporter" : "net importer"}.`,
      url: `/state/${slug}/`,
    },
  };
}

export default async function StatePage({ params }: Props) {
  const { slug } = await params;
  const state = getStateBySlug(slug);
  if (!state) notFound();

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'By State', url: '/state/' },
    { name: state.name, url: `/state/${slug}/` },
  ];

  const facts = buildStateFacts(state);
  const narrative = getStateNarrative(slug, state, facts);

  const allStates = getAllStates();
  const idx = allStates.findIndex((s) => s.slug === slug);
  const prev = idx > 0 ? allStates[idx - 1] : null;
  const next = idx < allStates.length - 1 ? allStates[idx + 1] : null;

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />

      <nav className="text-sm text-slate-500 mb-4">
        <Link href="/" className="hover:text-indigo-700">Home</Link>
        <span className="mx-2">&rsaquo;</span>
        <Link href="/state/" className="hover:text-indigo-700">By State</Link>
        <span className="mx-2">&rsaquo;</span>
        <span className="text-slate-700">{state.name}</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 mb-2">Import &amp; Trade in {state.name}</h1>
      <p className="text-lg text-slate-600 mb-6">{state.name} is {stateStatusLabel(facts.status)}, processing {state.importVolume} in imports annually. {state.overview}</p>

      {/* Key stats */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">Annual Imports</div>
          <div className="text-2xl font-bold text-slate-900">{state.importVolume}</div>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">Annual Exports</div>
          <div className="text-2xl font-bold text-slate-900">{state.exportVolume}</div>
        </div>
      </div>

      {/* Highlight */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-5 mb-8">
        <p className="text-sm font-medium text-amber-900">{state.tradeHighlight}</p>
      </div>

      {/* Major Ports */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Major Ports &amp; Entry Points</h2>
        <div className="flex flex-wrap gap-2">
          {state.majorPorts.map((port) => (
            <span key={port} className="inline-block px-3 py-1.5 rounded-lg bg-slate-100 text-sm text-slate-700 font-medium">
              {port}
            </span>
          ))}
        </div>
      </section>

      {/* Top Trade Partners */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Top Trade Partners</h2>
        <div className="flex flex-wrap gap-2">
          {state.topTradePartners.map((partner, i) => (
            <span key={partner} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-sm text-blue-800 font-medium">
              <span className="text-xs text-blue-500">#{i + 1}</span> {partner}
            </span>
          ))}
        </div>
      </section>

      {/* Top Imports & Exports */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Top Imported Goods</h2>
          <ol className="space-y-2">
            {state.topImports.map((item, i) => (
              <li key={item} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-sm text-slate-700">{item}</span>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">Top Exported Goods</h2>
          <ol className="space-y-2">
            {state.topExports.map((item, i) => (
              <li key={item} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-sm text-slate-700">{item}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* CTA */}
      <section className="rounded-xl bg-slate-50 border border-slate-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-2">Look Up Tariff Rates</h2>
        <p className="text-sm text-slate-600 mb-3">
          Search HS codes to find specific duty rates for goods imported into {state.name}.
        </p>
        <Link href="/search/" className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
          Search HS Codes &rarr;
        </Link>
      </section>

      {/* Prev / Next */}
      <nav className="flex justify-between items-center border-t border-slate-200 pt-6">
        {prev ? (
          <Link href={`/state/${prev.slug}/`} className="text-sm text-indigo-700 hover:underline">&larr; {prev.name}</Link>
        ) : <span />}
        {next ? (
          <Link href={`/state/${next.slug}/`} className="text-sm text-indigo-700 hover:underline">{next.name} &rarr;</Link>
        ) : <span />}
      </nav>

      <StateRich slug={slug} state={state} facts={facts} narrative={narrative} />

    </div>
  );
}
