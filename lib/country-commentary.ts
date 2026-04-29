/**
 * Country tariff commentary — Layer 2.
 * FACT → INTERPRETATION → IMPLICATION pattern.
 * 3 variants per slot × slug-hash rotation.
 */
import type { CountryFacts, TradeStatus } from "./country-facts";
import { pickSlot, fmtPct } from "./content-helpers";

// --- Trade Profile Narrative (main paragraph) ---

type NarrativeFn = (name: string, f: CountryFacts) => string;

const PROFILE_VARIANTS: Record<TradeStatus, NarrativeFn[]> = {
  "free-trader": [
    (n, f) => `${n} maintains an average MFN tariff of just ${fmtPct(f.avgMfn)}, ranking as the ${f.rankPhrase}. This near-zero tariff policy makes it one of the easiest markets to enter for exporters. The most protected sector is ${f.highestSector} at ${fmtPct(f.highestSectorRate)}, while most goods flow in duty-free or nearly so.`,
    (n, f) => `With an average import duty of ${fmtPct(f.avgMfn)} — ${f.vsGlobalPhrase} — ${n} operates as a virtually tariff-free economy. The ${f.rankPhrase} ranking reflects a deliberate strategy of trade openness. Even the highest-tariff sector (${f.highestSector}, ${fmtPct(f.highestSectorRate)}) stays well below other nations' averages.`,
    (n, f) => `At ${fmtPct(f.avgMfn)} average MFN, ${n} charges some of the lowest import duties worldwide. Ranked ${f.rankPhrase}, the country's trade regime favors minimal barriers. The gap between its most and least protected sectors — ${f.highestSector} (${fmtPct(f.highestSectorRate)}) vs. ${f.lowestSector} (${fmtPct(f.lowestSectorRate)}) — is notably narrow.`,
  ],
  "open": [
    (n, f) => `${n} applies an average MFN tariff of ${fmtPct(f.avgMfn)}, placing it among the more open trading economies — ${f.rankPhrase}. While lower than the global average of ${fmtPct(f.globalAvg)}, certain sectors see meaningful protection: ${f.highestSector} faces rates averaging ${fmtPct(f.highestSectorRate)}, a contrast to the near-zero duties on ${f.lowestSector}.`,
    (n, f) => `Ranking ${f.rankPhrase}, ${n}'s ${fmtPct(f.avgMfn)} average MFN rate sits ${f.vsGlobalPhrase}. The tariff landscape is not uniform — importers in ${f.highestSector} pay ${fmtPct(f.highestSectorRate)} on average, while ${f.lowestSector} products enter at ${fmtPct(f.lowestSectorRate)}. FTA networks further reduce effective rates for qualifying goods.`,
    (n, f) => `At ${fmtPct(f.avgMfn)} average MFN, ${n} keeps import barriers relatively low — ${f.vsGlobalPhrase}. The ${f.rankPhrase} position reflects balanced trade policy. Sectors like ${f.highestSector} (${fmtPct(f.highestSectorRate)}) see heavier protection, but the majority of product categories remain accessible.`,
  ],
  "moderate": [
    (n, f) => `${n} maintains a ${fmtPct(f.avgMfn)} average MFN tariff, ${f.vsGlobalPhrase}. As the ${f.rankPhrase}, its tariff policy balances trade openness with selective protection. The gap between sectors is wide: ${f.highestSector} faces ${fmtPct(f.highestSectorRate)}, while ${f.lowestSector} enters at just ${fmtPct(f.lowestSectorRate)}.`,
    (n, f) => `With an average import duty of ${fmtPct(f.avgMfn)}, ${n} sits in the middle of the global tariff spectrum — ${f.rankPhrase}. This rate is ${f.vsGlobalPhrase}. Importers should note the sharp variation: from ${fmtPct(f.lowestSectorRate)} on ${f.lowestSector} to ${fmtPct(f.highestSectorRate)} on ${f.highestSector}.`,
    (n, f) => `${n}'s ${fmtPct(f.avgMfn)} average tariff rate — ${f.rankPhrase} — reflects a mixed trade stance. Certain sectors enjoy relatively free access (${f.lowestSector} at ${fmtPct(f.lowestSectorRate)}), while others face steep barriers (${f.highestSector} at ${fmtPct(f.highestSectorRate)}). The overall rate is ${f.vsGlobalPhrase}.`,
  ],
  "protectionist": [
    (n, f) => `${n} imposes a ${fmtPct(f.avgMfn)} average MFN tariff — ${f.vsGlobalPhrase} — making it ${f.rankPhrase}. High barriers are concentrated in sectors like ${f.highestSector} (${fmtPct(f.highestSectorRate)}), signaling deliberate protection of domestic industries. Even lower-tariff categories like ${f.lowestSector} (${fmtPct(f.lowestSectorRate)}) exceed what free-trading nations charge on their most protected goods.`,
    (n, f) => `At ${fmtPct(f.avgMfn)} average MFN, ${n} is ${f.rankPhrase}. This rate is ${f.vsGlobalPhrase}. Importers face steep duties across most sectors — ${f.highestSector} averages ${fmtPct(f.highestSectorRate)} — though FTA channels can reduce costs significantly where available.`,
    (n, f) => `${n}'s tariff wall averages ${fmtPct(f.avgMfn)}, ${f.vsGlobalPhrase}. The ${f.rankPhrase} ranking underscores a protectionist trade stance. Sectors like ${f.highestSector} (${fmtPct(f.highestSectorRate)}) face particularly high barriers, while even the most accessible category — ${f.lowestSector} — still charges ${fmtPct(f.lowestSectorRate)}.`,
  ],
  "fortress": [
    (n, f) => `${n} maintains one of the highest tariff regimes globally at ${fmtPct(f.avgMfn)} average MFN — ${f.vsGlobalPhrase}. Ranked ${f.rankPhrase}, the country uses steep import duties as a core economic policy tool. ${f.highestSector} faces ${fmtPct(f.highestSectorRate)} average tariffs, and even the lowest-barrier sector (${f.lowestSector}) charges ${fmtPct(f.lowestSectorRate)}.`,
    (n, f) => `At ${fmtPct(f.avgMfn)} average MFN, ${n} is ${f.rankPhrase}. This rate is ${f.vsGlobalPhrase}, reflecting a heavily protectionist policy. Importers must navigate steep duties across nearly all sectors, from ${f.highestSector} (${fmtPct(f.highestSectorRate)}) down to ${f.lowestSector} (${fmtPct(f.lowestSectorRate)}).`,
    (n, f) => `${n}'s ${fmtPct(f.avgMfn)} average import tariff places it as ${f.rankPhrase}. This is ${f.vsGlobalPhrase}. The breadth of protection is notable: ${f.highestSector} tops out at ${fmtPct(f.highestSectorRate)}, but few sectors drop below ${fmtPct(f.lowestSectorRate)} (${f.lowestSector}).`,
  ],
};

export function getTradeProfileNarrative(slug: string, name: string, facts: CountryFacts): string {
  const variants = PROFILE_VARIANTS[facts.status];
  const fn = pickSlot(slug, "profile", variants);
  return fn(name, facts);
}

// --- FTA Insight (if ftaCount > 0) ---

const FTA_VARIANTS: ((name: string, f: CountryFacts) => string)[] = [
  (n, f) => `${n}'s ${f.ftaCount} free trade agreements cover approximately ${fmtPct(f.ftaCoveredPct, 0)} of tariff lines, offering an average duty reduction of ${fmtPct(f.ftaSavingAvg)} per qualifying product. For eligible exporters, these agreements can transform the cost structure of doing business with ${n}.`,
  (n, f) => `Through ${f.ftaCount} FTAs covering ${fmtPct(f.ftaCoveredPct, 0)} of product codes, importers into ${n} can save an average of ${fmtPct(f.ftaSavingAvg)} per item — a significant advantage in competitive markets. A valid Certificate of Origin is required to claim these preferential rates.`,
  (n, f) => `${n} has negotiated ${f.ftaCount} trade agreements that reduce tariffs on ${fmtPct(f.ftaCoveredPct, 0)} of tariff lines. The average FTA saving is ${fmtPct(f.ftaSavingAvg)} per product — which, applied across a container-load of goods, can mean thousands of dollars in reduced import costs.`,
];

export function getFtaInsight(slug: string, name: string, facts: CountryFacts): string | null {
  if (facts.ftaCount === 0 || facts.ftaSavingAvg <= 0) return null;
  const fn = pickSlot(slug, "fta-insight", FTA_VARIANTS);
  return fn(name, facts);
}

// --- Implication callout (what this means for importers) ---

const IMPLICATION_VARIANTS: Record<TradeStatus, ((name: string, f: CountryFacts) => string)[]> = {
  "free-trader": [
    (n) => `Importers benefit from minimal tariff friction when shipping to ${n}. Focus due diligence on non-tariff barriers (labeling, standards, inspections) rather than duty costs.`,
    (n) => `${n}'s near-zero tariffs mean landed cost calculations are driven by logistics and compliance, not duties. This makes it an attractive market for test shipments and new market entry.`,
    (n) => `For most product categories, duty costs into ${n} are negligible. The real cost drivers are shipping, insurance, and meeting local product standards.`,
  ],
  "open": [
    (n, f) => `While ${n}'s overall tariff environment is favorable, importers in protected sectors like ${f.highestSector} should explore FTA eligibility to reduce costs. For most other goods, duties are a minor line item.`,
    (n, f) => `${n}'s open trade stance keeps duties manageable for most products. Priority for cost optimization: use FTA rates where available (${f.ftaCount} agreements in force) and ensure accurate HS classification to avoid overpaying.`,
    (n, f) => `Importing into ${n} is cost-effective for most product categories. The exceptions — ${f.highestSector} and adjacent sectors — are where FTA-eligible sourcing provides the biggest advantage.`,
  ],
  "moderate": [
    (n, f) => `${n}'s mixed tariff environment means sector matters. Low-duty categories offer straightforward market access, while protected sectors like ${f.highestSector} require careful cost planning. FTA certificates are worth the administrative effort here.`,
    (n, f) => `For ${n}, tariff costs vary dramatically by product. Importers should classify goods precisely — a single HS digit can mean a 10+ percentage point duty difference. FTA eligibility (${f.ftaCount} agreements) can be the deciding factor in profitability.`,
    (n, f) => `The wide tariff range in ${n} (${fmtPct(f.lowestSectorRate)} to ${fmtPct(f.highestSectorRate)}) means importers need sector-specific strategies. Protected categories may justify local manufacturing or FTA-eligible sourcing arrangements.`,
  ],
  "protectionist": [
    (n, f) => `${n}'s high tariff wall makes FTA access critical for competitive pricing. Without preferential rates, import duties alone can erase margins. Explore all ${f.ftaCount} FTA pathways and consider bonded warehouse or free-trade zone strategies.`,
    (n, f) => `Importing into ${n} requires tariff-aware supply chain planning. At ${fmtPct(f.avgMfn)} average duty, costs stack up quickly. FTA sourcing, duty drawback programs, and accurate HS classification are essential tools.`,
    (n, f) => `${n}'s protectionist stance means import duties are a primary cost driver — not a rounding error. Evaluate whether FTA-eligible sourcing (${f.ftaCount} agreements) or local production better serves your market entry strategy.`,
  ],
  "fortress": [
    (n, f) => `${n}'s fortress tariff regime demands careful market-entry strategy. At ${fmtPct(f.avgMfn)} average duty, direct import may not be viable without FTA access. Consider joint ventures, local assembly, or bonded zone operations as alternatives to full-duty importation.`,
    (n, f) => `Breaking into ${n}'s market means confronting some of the world's highest tariffs. Without FTA preferential access, budget for ${fmtPct(f.avgMfn)} average duties. For high-tariff sectors like ${f.highestSector}, the effective landed cost can double the FOB price.`,
    (n, f) => `${n}'s steep tariffs (${fmtPct(f.avgMfn)} avg) make import cost planning non-negotiable. Three paths to manage this: FTA certificates (${f.ftaCount} agreements), tariff engineering through component-level classification, or local sourcing of the highest-duty inputs.`,
  ],
};

export function getImplication(slug: string, name: string, facts: CountryFacts): string {
  const variants = IMPLICATION_VARIANTS[facts.status];
  const fn = pickSlot(slug, "implication", variants);
  return fn(name, facts);
}
