import type { Metadata } from "next";
import { searchCodes } from "@/lib/db";
import { formatHSCode, levelLabel } from "@/lib/format";

export const metadata: Metadata = {
  title: "Search HS Codes",
  description: "Search the Harmonized System database. Find HS codes by product name or code number for customs classification.",
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const results = q ? searchCodes(q, 50) : [];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Search HS Codes</h1>
      <p className="text-slate-600 mb-6">Find the right HS code for your product</p>

      <form className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Enter product name or HS code (e.g. 'coffee' or '0901')"
            className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
          />
          <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Search
          </button>
        </div>
      </form>

      {q && (
        <div>
          <p className="text-sm text-slate-500 mb-4">{results.length} results for &ldquo;{q}&rdquo;</p>
          {results.length > 0 ? (
            <div className="space-y-2">
              {results.map((r) => (
                <a key={r.hscode} href={`/code/${r.slug}`} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                  <div>
                    <span className="font-mono text-indigo-600 font-bold">{formatHSCode(r.hscode)}</span>
                    <span className="text-xs text-slate-400 ml-2">{levelLabel(r.level)}</span>
                  </div>
                  <span className="text-sm text-slate-700 flex-1">{r.description}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">No results found. Try a different search term.</p>
          )}
        </div>
      )}

      {!q && (
        <div className="bg-slate-50 rounded-lg p-6">
          <h2 className="font-bold mb-3">Popular Searches</h2>
          <div className="flex flex-wrap gap-2">
            {["coffee", "electronics", "textiles", "steel", "plastic", "automobile", "pharmaceutical", "furniture", "toys", "rubber"].map((term) => (
              <a key={term} href={`/search?q=${term}`} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-sm hover:border-indigo-300 hover:bg-indigo-50">
                {term}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
