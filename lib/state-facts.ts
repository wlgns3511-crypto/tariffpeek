/**
 * State trade facts + commentary — Chunk 2 Layer 1+2.
 * Classifies states by trade volume, generates variant narratives.
 */
import type { StateTradeData } from "./states-data";
import { pickSlot } from "./content-helpers";

// --- Volume parsing ---

/** Parse "$450B annually" → 450_000 (in millions) */
function parseVolume(v: string): number {
  const m = v.match(/([\d.]+)\s*(T|B|M|K)?/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  switch (m[2]?.toUpperCase()) {
    case "T": return n * 1_000_000;
    case "B": return n * 1_000;
    case "M": return n;
    case "K": return n / 1_000;
    default: return n;
  }
}

// --- Status buckets ---

export type TradeVolumeStatus =
  | "mega-hub"      // $100B+ imports
  | "major"         // $25B–100B
  | "mid-tier"      // $10B–25B
  | "emerging"      // $3B–10B
  | "small";        // < $3B

export function classifyState(importVol: string): TradeVolumeStatus {
  const m = parseVolume(importVol);
  if (m >= 100_000) return "mega-hub";
  if (m >= 25_000) return "major";
  if (m >= 10_000) return "mid-tier";
  if (m >= 3_000) return "emerging";
  return "small";
}

const STATUS_LABEL: Record<TradeVolumeStatus, string> = {
  "mega-hub": "one of America's largest trade gateways",
  "major": "a major player in US international trade",
  "mid-tier": "an active participant in US trade",
  "emerging": "a growing trade corridor",
  "small": "a niche trade economy",
};

export function stateStatusLabel(status: TradeVolumeStatus): string {
  return STATUS_LABEL[status];
}

// --- Facts ---

export interface StateFacts {
  status: TradeVolumeStatus;
  importMillions: number;
  exportMillions: number;
  isExporter: boolean;   // exports > imports
  portCount: number;
  partnerCount: number;
  topPartner: string;
  topImport: string;
  topExport: string;
}

export function buildStateFacts(state: StateTradeData): StateFacts {
  const imp = parseVolume(state.importVolume);
  const exp = parseVolume(state.exportVolume);
  return {
    status: classifyState(state.importVolume),
    importMillions: imp,
    exportMillions: exp,
    isExporter: exp > imp,
    portCount: state.majorPorts.length,
    partnerCount: state.topTradePartners.length,
    topPartner: state.topTradePartners[0] || "",
    topImport: state.topImports[0] || "",
    topExport: state.topExports[0] || "",
  };
}

// --- Commentary variants ---

type NarrFn = (name: string, s: StateTradeData, f: StateFacts) => string;

const PROFILE_VARIANTS: Record<TradeVolumeStatus, NarrFn[]> = {
  "mega-hub": [
    (n, s, f) => `${n} processes ${s.importVolume} in imports and ${s.exportVolume} in exports annually, making it ${stateStatusLabel(f.status)}. The state's ${f.portCount} major port${f.portCount > 1 ? "s" : ""} — including ${s.majorPorts.slice(0, 2).join(" and ")} — handle goods ranging from ${s.topImports[0]?.toLowerCase()} to ${s.topImports[2]?.toLowerCase() ?? s.topImports[1]?.toLowerCase()}.`,
    (n, s, f) => `With ${s.importVolume} in annual imports flowing through ${f.portCount} major entry point${f.portCount > 1 ? "s" : ""}, ${n} is ${stateStatusLabel(f.status)}. ${s.topTradePartners[0]} leads as the top partner, followed by ${s.topTradePartners.slice(1, 3).join(" and ")}. The export side (${s.exportVolume}) is anchored by ${s.topExports[0]?.toLowerCase()}.`,
    (n, s, f) => `${n}'s ${s.importVolume} import footprint and ${s.exportVolume} in exports place it as ${stateStatusLabel(f.status)}. International goods move primarily through ${s.majorPorts[0]}, where ${s.topImports[0]?.toLowerCase()} and ${s.topImports[1]?.toLowerCase()} top the inbound manifest.`,
  ],
  "major": [
    (n, s, f) => `${n} handles ${s.importVolume} in imports and ${s.exportVolume} in exports per year — ${stateStatusLabel(f.status)}. Key goods include ${s.topImports.slice(0, 3).map(g => g.toLowerCase()).join(", ")} on the import side, with ${s.topExports[0]?.toLowerCase()} leading exports.`,
    (n, s, f) => `As ${stateStatusLabel(f.status)}, ${n} moves ${s.importVolume} in goods inbound through ${f.portCount} port${f.portCount > 1 ? "s" : ""}. ${s.topTradePartners[0]} is the dominant trade partner. ${f.isExporter ? `Notably, ${n} exports (${s.exportVolume}) exceed its imports.` : `Imports outpace exports (${s.exportVolume}).`}`,
    (n, s, f) => `${n}'s trade profile — ${s.importVolume} imported, ${s.exportVolume} exported — reflects its position as ${stateStatusLabel(f.status)}. The ${s.majorPorts[0]} serves as the primary gateway, connecting to ${s.topTradePartners.slice(0, 3).join(", ")}.`,
  ],
  "mid-tier": [
    (n, s, f) => `${n} processes ${s.importVolume} in annual imports and ${s.exportVolume} in exports — ${stateStatusLabel(f.status)}. Trade flows through ${s.majorPorts[0]}, with ${s.topTradePartners.slice(0, 3).join(", ")} as leading partners. ${s.topImports[0]} tops the import list.`,
    (n, s, f) => `With ${s.importVolume} in imports moving through ${f.portCount} entry point${f.portCount > 1 ? "s" : ""}, ${n} is ${stateStatusLabel(f.status)}. Top inbound goods include ${s.topImports.slice(0, 2).map(g => g.toLowerCase()).join(" and ")}, while ${s.topExports[0]?.toLowerCase()} anchors the export side at ${s.exportVolume}.`,
    (n, s, f) => `${n} channels ${s.importVolume} in imports and ${s.exportVolume} in exports annually, positioning it as ${stateStatusLabel(f.status)}. ${s.topTradePartners[0]} leads the partner roster, with ${s.topImports[0]?.toLowerCase()} as the largest import category.`,
  ],
  "emerging": [
    (n, s, f) => `${n} handles ${s.importVolume} in imports and ${s.exportVolume} in exports, making it ${stateStatusLabel(f.status)}. Goods move through ${s.majorPorts[0]}, primarily with ${s.topTradePartners.slice(0, 2).join(" and ")}. ${s.topExports[0]} is the leading export product.`,
    (n, s, f) => `With ${s.importVolume} in annual imports, ${n} serves as ${stateStatusLabel(f.status)}. ${f.isExporter ? `The state is a net exporter at ${s.exportVolume}.` : `Exports total ${s.exportVolume}.`} Trade is concentrated with ${s.topTradePartners[0]}, flowing through ${s.majorPorts[0]}.`,
    (n, s, f) => `${n}'s ${s.importVolume} in imports and ${s.exportVolume} in exports flow through ${f.portCount} trade gateway${f.portCount > 1 ? "s" : ""}, anchored by ${s.majorPorts[0]}. ${s.topTradePartners.slice(0, 2).join(" and ")} are the primary trading partners.`,
  ],
  "small": [
    (n, s, f) => `${n} processes ${s.importVolume} in imports and ${s.exportVolume} in exports annually — ${stateStatusLabel(f.status)}. Trade moves through ${s.majorPorts[0]}, primarily with ${s.topTradePartners.slice(0, 2).join(" and ")}. ${s.topExports[0]} is the signature export.`,
    (n, s, f) => `While smaller in volume at ${s.importVolume} imports, ${n} plays a specialized role in US trade. ${s.topExports[0]} dominates exports (${s.exportVolume}), primarily to ${s.topTradePartners[0]}. ${s.majorPorts[0]} serves as the main trade conduit.`,
    (n, s, f) => `${n}'s trade footprint — ${s.importVolume} in, ${s.exportVolume} out — reflects ${stateStatusLabel(f.status)} focused on ${s.topExports[0]?.toLowerCase()} exports and ${s.topImports[0]?.toLowerCase()} imports through ${s.majorPorts[0]}.`,
  ],
};

export function getStateNarrative(slug: string, state: StateTradeData, facts: StateFacts): string {
  const fn = pickSlot(slug, "state-profile", PROFILE_VARIANTS[facts.status]);
  return fn(state.name, state, facts);
}

// --- Partner-to-country slug mapping (for cross-links) ---

const PARTNER_SLUG: Record<string, string> = {
  "China": "china", "Japan": "japan", "South Korea": "korea", "Germany": "eu",
  "Canada": "canada", "Mexico": "mexico", "Brazil": "brazil", "United Kingdom": "uk",
  "UK": "uk", "India": "india", "Australia": "australia", "Vietnam": "vietnam",
  "Thailand": "thailand", "Taiwan": "taiwan", "Indonesia": "indonesia", "Turkey": "turkey",
  "Singapore": "singapore", "UAE": "uae", "Saudi Arabia": "saudi-arabia",
  "South Africa": "south-africa", "France": "eu", "Italy": "eu", "Netherlands": "eu",
  "Belgium": "eu", "Spain": "eu", "Ireland": "eu", "Switzerland": "eu",
};

export function partnerToSlug(partner: string): string | null {
  return PARTNER_SLUG[partner] ?? null;
}
