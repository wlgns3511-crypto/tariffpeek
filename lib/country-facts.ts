/**
 * Country tariff facts engine — Layer 1.
 * Classifies countries into trade-openness status buckets,
 * then generates data-driven facts from DB queries.
 */
import type { CountryRankRow } from "./db";
import { fmtPct, ordinal, ratioPhrase } from "./content-helpers";

// --- Status buckets ---

export type TradeStatus =
  | "free-trader"     // avg MFN ≤ 3%
  | "open"            // avg MFN 3–6%
  | "moderate"        // avg MFN 6–10%
  | "protectionist"   // avg MFN 10–15%
  | "fortress";       // avg MFN > 15%

export function classifyCountry(avgMfn: number): TradeStatus {
  if (avgMfn <= 3) return "free-trader";
  if (avgMfn <= 6) return "open";
  if (avgMfn <= 10) return "moderate";
  if (avgMfn <= 15) return "protectionist";
  return "fortress";
}

const STATUS_LABEL: Record<TradeStatus, string> = {
  "free-trader": "one of the world's most open economies",
  "open": "a relatively open trading economy",
  "moderate": "a moderately protectionist economy",
  "protectionist": "a notably protectionist trading economy",
  "fortress": "one of the most protected markets globally",
};

export function statusLabel(status: TradeStatus): string {
  return STATUS_LABEL[status];
}

// --- Fact generation ---

export interface CountryFacts {
  status: TradeStatus;
  rank: number;          // 1 = lowest avg MFN (most open)
  totalCountries: number;
  avgMfn: number;
  globalAvg: number;
  ftaCount: number;
  ftaSavingAvg: number;
  ftaCoveredPct: number;
  highestSector: string;
  highestSectorRate: number;
  lowestSector: string;
  lowestSectorRate: number;
  vsGlobalPhrase: string;
  rankPhrase: string;
}

export function buildCountryFacts(
  slug: string,
  countryName: string,
  rankings: CountryRankRow[],
  globalAvg: number,
  ftaSavings: { avg_saving: number; covered_pct: number },
): CountryFacts {
  const row = rankings.find((r) => r.country_slug === slug);
  const rank = rankings.findIndex((r) => r.country_slug === slug) + 1;
  const avgMfn = row?.avg_mfn ?? 0;
  const status = classifyCountry(avgMfn);

  const vsGlobal = avgMfn / globalAvg;
  let vsGlobalPhrase: string;
  if (vsGlobal >= 1.5) vsGlobalPhrase = `${ratioPhrase(avgMfn, globalAvg)} the global average of ${fmtPct(globalAvg)}`;
  else if (vsGlobal >= 1.1) vsGlobalPhrase = `above the global average of ${fmtPct(globalAvg)}`;
  else if (vsGlobal >= 0.9) vsGlobalPhrase = `close to the global average of ${fmtPct(globalAvg)}`;
  else if (vsGlobal >= 0.5) vsGlobalPhrase = `below the global average of ${fmtPct(globalAvg)}`;
  else vsGlobalPhrase = `far below the global average of ${fmtPct(globalAvg)}`;

  const rankPhrase = rank <= 3
    ? `${ordinal(rank)} most open among ${rankings.length} major trading nations`
    : rank >= rankings.length - 2
      ? `${ordinal(rankings.length - rank + 1)} most restrictive among ${rankings.length} nations`
      : `${ordinal(rank)} out of ${rankings.length} major trading nations by openness`;

  return {
    status,
    rank,
    totalCountries: rankings.length,
    avgMfn,
    globalAvg,
    ftaCount: row?.fta_count ?? 0,
    ftaSavingAvg: ftaSavings.avg_saving,
    ftaCoveredPct: ftaSavings.covered_pct,
    highestSector: row?.highest_chapter_desc ?? "",
    highestSectorRate: row?.highest_chapter_rate ?? 0,
    lowestSector: row?.lowest_chapter_desc ?? "",
    lowestSectorRate: row?.lowest_chapter_rate ?? 0,
    vsGlobalPhrase,
    rankPhrase,
  };
}
