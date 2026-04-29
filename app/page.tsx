import type { Metadata } from "next";
import { getAllSections, getChapters, countCodes, getAllCountries, getTopCodes } from "@/lib/db";
import { PopularEntities } from "@/components/upgrades/PopularEntities";
import { getAllStates } from "@/lib/states-data";

export function generateMetadata(): Metadata {
  const totalCodes = countCodes();
  const countries = getAllCountries();
  const states = getAllStates();
  return {
    title: `HS Code Lookup — ${totalCodes.toLocaleString()} Codes · ${countries.length} Countries · 2026 Tariff Data`,
    description: `Search ${totalCodes.toLocaleString()} Harmonized System codes with US duty rates, FTA preferences, and import documents. Compare tariffs across ${countries.length} countries and trade data for ${states.length} US states. USITC 2026 data, updated monthly.`,
    alternates: { canonical: "/" },
    openGraph: {
      title: `TariffPeek — ${totalCodes.toLocaleString()} HS Codes · Tariff Rates for ${countries.length} Countries`,
      description: `Free HS code lookup with duty rates, FTA savings, and import docs. ${countries.length} countries, ${states.length} US states.`,
      url: "/",
    },
  };
}

export default function HomePage() {
  const sections = getAllSections();
  const chapters = getChapters();
  const totalCodes = countCodes();

  const topCodes = getTopCodes(12);
  const popularItems = topCodes.map(c => ({
    name: `${c.hscode} — ${c.description.substring(0, 40)}${c.description.length > 40 ? '...' : ''}`,
    href: `/code/${c.slug}/`,
    stat: c.us_avg_duty != null ? `${c.us_avg_duty.toFixed(1)}%` : undefined,
  }));

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">HS Code Lookup & Trade Classification</h1>
      <p className="text-lg text-slate-600 mb-8">
        Search {totalCodes.toLocaleString()} Harmonized System codes used in international trade.
        Find the right HS code for customs classification, tariff rates, and import/export documentation.
      </p>

      {/* Search */}
      <div className="bg-indigo-50 rounded-lg p-6 mb-10">
        <h2 className="text-xl font-bold mb-3">Search HS Codes</h2>
        <p className="text-sm text-slate-600 mb-3">Enter a product name or HS code number</p>
        <a href="/search" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          Search HS Codes →
        </a>
      </div>

      <PopularEntities
        heading="Most Searched HS Codes"
        subheading="Common HS codes with US duty rates"
        items={popularItems}
        columns={3}
        viewAllHref="/rankings"
        viewAllLabel="View all HS codes →"
      />

      {/* Sections */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Browse by Section</h2>
        <div className="grid gap-3">
          {sections.map((s) => (
            <a key={s.id} href={`/section/${s.id}`} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
              <span className="text-sm font-mono text-indigo-600 w-10">{s.id}</span>
              <div className="flex-1">
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-slate-400">Chapters {s.chapter_range}</div>
              </div>
              <span className="text-slate-400">→</span>
            </a>
          ))}
        </div>
      </section>

      {/* Chapters */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">All 97 Chapters</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {chapters.map((ch) => (
            <a key={ch.hscode} href={`/code/${ch.slug}`} className="p-3 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
              <span className="font-mono text-indigo-600 text-sm">Ch. {ch.hscode}</span>
              <span className="text-sm text-slate-700 ml-2">{ch.description.substring(0, 50)}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Browse by Country */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Import Tariff Rates by Country</h2>
        <p className="text-sm text-slate-600 mb-4">Browse tariff rates for 20 major trading nations. Compare import duties, FTA benefits, and required documents.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(() => {
            let countries: { slug: string; name: string }[] = [];
            try { countries = getAllCountries(); } catch { /* table may not exist yet */ }
            return countries.map((c) => (
              <a key={c.slug} href={`/import/${c.slug}`} className="p-3 bg-slate-50 rounded-lg text-sm hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-center">
                {c.name}
              </a>
            ));
          })()}
        </div>
      </section>

      {/* Browse by State */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Import &amp; Trade by US State</h2>
        <p className="text-sm text-slate-600 mb-4">Explore international trade data for all 50 states — major ports, top goods, and trade partners.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
          {getAllStates().map((s) => (
            <a key={s.slug} href={`/state/${s.slug}/`} className="p-2 bg-slate-50 rounded-lg text-sm hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-center">
              <span className="font-mono text-xs text-slate-400 mr-1">{s.code}</span> {s.name}
            </a>
          ))}
        </div>
        <div className="mt-3">
          <a href="/state/" className="text-sm text-indigo-600 hover:underline font-medium">View all state trade data &rarr;</a>
        </div>
      </section>

      {/* What is HS Code */}
      <section className="bg-slate-50 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-3">What is an HS Code?</h2>
        <p className="text-slate-700 text-sm mb-3">
          The Harmonized System (HS) is an international nomenclature developed by the World Customs Organization (WCO) for classifying traded goods.
          It is used by more than 200 countries as the basis for customs tariffs and trade statistics.
        </p>
        <p className="text-slate-700 text-sm mb-3">
          HS codes are organized hierarchically: 2-digit chapter codes, 4-digit heading codes, and 6-digit subheading codes.
          The first 6 digits are standardized worldwide, while individual countries add additional digits for national tariff lines.
        </p>
        <p className="text-slate-700 text-sm">
          Correctly classifying your goods is essential for determining tariff rates, compliance with trade regulations, and avoiding customs delays or penalties.
        </p>
      </section>
    </div>
  );
}
