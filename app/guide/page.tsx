import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllGuides } from '@/lib/guides';

export const metadata: Metadata = {
  title: 'Tariff & Import Guides — HTS Codes, Section 301/232/IEEPA, First Sale, Drawback',
  description: 'In-depth guides on US tariffs: how to find HTS codes, the 3 types of US tariffs, who actually pays the 2025 Trump tariffs, the First Sale Rule, and duty drawback recovery.',
  alternates: { canonical: '/guide/' },
  openGraph: { title: 'Tariff & Import Guides', description: 'Authoritative guides on US tariffs, HTS classification, and duty reduction.', url: '/guide/' },
};

export default function GuidesIndex() {
  const guides = getAllGuides();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'TariffPeek Guides',
            url: 'https://tariffpeek.com/guide/',
            numberOfItems: guides.length,
            itemListElement: guides.map((g, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: g.title,
              url: `https://tariffpeek.com/guide/${g.slug}/`,
            })),
          }),
        }}
      />

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Tariff & Import Guides</h1>
        <p className="text-slate-600 max-w-3xl">
          Long-form, evidence-based guides on US tariffs and import strategy. How to classify
          products under HTS codes, the three legal types of US tariffs (Section 301, Section
          232, IEEPA), who actually pays the 2025 Trump tariffs, the First Sale Rule that cuts
          duties 20-40%, and duty drawback for re-exported goods.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-4">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/guide/${g.slug}/`}
            className="block rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 p-5 transition-colors"
          >
            <div className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">{g.category}</div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">{g.title}</h2>
            <p className="text-sm text-slate-600">{g.description}</p>
          </Link>
        ))}
      </div>

      <section className="mt-12 p-6 rounded-xl bg-slate-50 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Look up real tariff rates</h2>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/search/" className="text-indigo-700 hover:underline font-medium">Search by HTS code →</Link>
            <span className="text-slate-500"> find your product&apos;s tariff rate</span>
          </li>
        </ul>
      </section>
    </div>
  );
}
