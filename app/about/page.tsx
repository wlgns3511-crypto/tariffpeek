import type { Metadata } from "next";
import { countCodes, getAllCountries, getChapters, getGlobalAvgDuty } from "@/lib/db";
import { getAllStates } from "@/lib/states-data";

export function generateMetadata(): Metadata {
  const totalCodes = countCodes();
  return {
    title: `About TariffPeek — ${totalCodes.toLocaleString()} HS Codes, ${getAllCountries().length} Countries`,
    description: `TariffPeek indexes ${totalCodes.toLocaleString()} Harmonized System codes with US duty rates across ${getAllCountries().length} countries and ${getAllStates().length} US states. Data sourced from USITC HTS, WCO, and USTR FTA texts. Updated monthly.`,
    alternates: { canonical: "/about/" },
    openGraph: { url: "/about/" },
  };
}

export default function AboutPage() {
  const totalCodes = countCodes();
  const countries = getAllCountries();
  const chapters = getChapters();
  const states = getAllStates();
  const globalAvg = getGlobalAvgDuty();

  return (
    <article className="prose prose-slate max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">About TariffPeek</h1>

      <p>
        TariffPeek is a free reference tool that indexes {totalCodes.toLocaleString()} Harmonized System codes
        with US duty rates, FTA preferences, and import documentation requirements. We cover tariff
        schedules for {countries.length} major trading nations and trade profiles for all {states.length} US states.
      </p>

      {/* Data snapshot */}
      <div className="not-prose grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4 text-center">
          <div className="text-2xl font-bold text-indigo-700">{totalCodes.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">HS Codes</div>
        </div>
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4 text-center">
          <div className="text-2xl font-bold text-emerald-700">{chapters.length}</div>
          <div className="text-xs text-slate-500 mt-1">Chapters</div>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">{countries.length}</div>
          <div className="text-xs text-slate-500 mt-1">Countries</div>
        </div>
        <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-4 text-center">
          <div className="text-2xl font-bold text-amber-700">{globalAvg.toFixed(1)}%</div>
          <div className="text-xs text-slate-500 mt-1">Global Avg MFN</div>
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-3">Our Mission</h2>
      <p>
        Correctly classifying goods is essential for determining tariff rates, complying with trade regulations,
        and avoiding costly customs delays. Our goal is to make HS code lookup fast, intuitive, and accessible
        to everyone &mdash; from first-time importers to experienced trade professionals.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Data Sources</h2>
      <p>
        TariffPeek cross-references multiple authoritative sources to build each code&apos;s profile:
      </p>
      <ul>
        <li><strong>USITC Harmonized Tariff Schedule</strong> &mdash; the legal US tariff schedule with 10-digit HTS codes and MFN duty rates.</li>
        <li><strong>WCO Harmonized System (HS 2022)</strong> &mdash; the international 6-digit nomenclature used by 200+ countries.</li>
        <li><strong>USTR FTA Texts</strong> &mdash; preferential duty rates under US free trade agreements.</li>
        <li><strong>US Census Bureau Foreign Trade Statistics</strong> &mdash; state-level import/export data for all {states.length} states.</li>
        <li><strong>CBP CROSS Rulings</strong> &mdash; binding classification rulings for borderline products.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-3">How It Works</h2>
      <p>
        Search by product name, keyword, or HS code number. Results are organized hierarchically:
        {chapters.length} chapters (2-digit), headings (4-digit), and subheadings (6-digit). The first six digits
        are standardized worldwide, while the US extends to 10 digits for its national tariff lines.
        Each code page includes the MFN duty rate, FTA preferences, required import documents, and a duty calculator.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-3">Contact Us</h2>
      <p>
        Have questions or feedback? Visit our{" "}
        <a href="/contact" className="text-indigo-600 hover:underline">Contact page</a> to get in touch.
      </p>
    </article>
  );
}
