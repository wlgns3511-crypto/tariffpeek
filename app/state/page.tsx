import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllStates } from '@/lib/states-data';
import { breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Import & Trade by US State — Ports, Top Goods & Partners',
  description: 'Browse international trade data for all 50 US states and DC. Major ports, top imported and exported goods, key trade partners, and trade volumes.',
  alternates: { canonical: '/state/' },
  openGraph: {
    title: 'Import & Trade by US State',
    description: 'International trade data for all 50 US states and DC.',
    url: '/state/',
  },
};

export default function StatesIndex() {
  const states = getAllStates();

  const crumbs = [
    { name: 'Home', url: '/' },
    { name: 'By State', url: '/state/' },
  ];

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema(crumbs)) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'US State Trade Data',
            url: 'https://tariffpeek.com/state/',
            numberOfItems: states.length,
            itemListElement: states.map((s, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: `Import & Trade in ${s.name}`,
              url: `https://tariffpeek.com/state/${s.slug}/`,
            })),
          }),
        }}
      />

      <nav className="text-sm text-slate-500 mb-4">
        <Link href="/" className="hover:text-indigo-700">Home</Link>
        <span className="mx-2">&rsaquo;</span>
        <span className="text-slate-700">By State</span>
      </nav>

      <h1 className="text-3xl font-bold text-slate-900 mb-2">Import &amp; Trade by US State</h1>
      <p className="text-lg text-slate-600 mb-8">
        Explore international trade data for all 50 US states and the District of Columbia.
        See major ports, top imported and exported goods, key trade partners, and annual trade volumes.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {states.map((s) => (
          <Link
            key={s.slug}
            href={`/state/${s.slug}/`}
            className="block rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 p-4 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-900">{s.name}</h2>
              <span className="text-xs font-mono text-slate-400">{s.code}</span>
            </div>
            <p className="text-xs text-slate-500 mb-2 line-clamp-2">{s.tradeHighlight}</p>
            <div className="flex gap-3 text-xs">
              <span className="text-indigo-600 font-medium">Import {s.importVolume}</span>
              <span className="text-emerald-600 font-medium">Export {s.exportVolume}</span>
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-12 rounded-xl bg-slate-50 border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Search Tariff Rates</h2>
        <p className="text-sm text-slate-600 mb-3">
          Look up HS codes and duty rates for specific products imported into the United States.
        </p>
        <Link href="/search/" className="inline-block px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
          Search HS Codes &rarr;
        </Link>
      </section>
    </div>
  );
}
