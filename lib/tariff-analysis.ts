/**
 * HS Code analysis: trade context and classification guidance
 */

import type { HSCode, Section } from './db';

// Section trade context
const sectionContext: Record<string, { overview: string; tradeNote: string; keyProducts: string }> = {
  I: { overview: "Section I covers live animals and animal products, one of the oldest categories of international trade.", tradeNote: "Many countries impose strict sanitary and phytosanitary (SPS) requirements on animal imports. USDA and EU health certificates are commonly required.", keyProducts: "cattle, poultry, fish, dairy, eggs, honey" },
  II: { overview: "Section II covers vegetable products including fruits, vegetables, cereals, and coffee — essential agricultural commodities.", tradeNote: "Agricultural products often face seasonal tariffs, quotas, and subsidies. Phytosanitary certificates are typically required.", keyProducts: "wheat, rice, coffee, tea, fruits, vegetables, spices" },
  III: { overview: "Section III covers animal and vegetable fats and oils, including cooking oils and industrial fats.", tradeNote: "Palm oil, soybean oil, and olive oil are among the most traded commodities globally. Some countries apply differential tariffs based on processing level.", keyProducts: "palm oil, soybean oil, olive oil, margarine" },
  IV: { overview: "Section IV covers prepared foodstuffs, beverages, spirits, and tobacco — processed food products.", tradeNote: "Highly regulated sector with excise taxes on alcohol and tobacco. Food safety standards (FDA, EU) significantly impact trade.", keyProducts: "chocolate, beer, wine, spirits, tobacco, sugar" },
  V: { overview: "Section V covers mineral products including fuels, ores, and salt — critical raw materials.", tradeNote: "Energy products (crude oil, natural gas, coal) dominate global trade by value. Subject to strategic trade policies and sanctions.", keyProducts: "crude oil, natural gas, coal, iron ore, salt" },
  VI: { overview: "Section VI covers chemical and pharmaceutical products — a high-value trade sector.", tradeNote: "Pharmaceutical imports often require regulatory approval (FDA, EMA). Chemical safety data sheets (SDS) are mandatory for most products.", keyProducts: "pharmaceuticals, fertilizers, cosmetics, paints, plastics" },
  VII: { overview: "Section VII covers plastics and rubber products, essential materials for manufacturing.", tradeNote: "Environmental regulations increasingly affect plastic trade. Some countries ban certain single-use plastics.", keyProducts: "polyethylene, PVC, rubber tires, silicone" },
  XI: { overview: "Section XI covers textiles and textile articles — one of the largest employment sectors globally.", tradeNote: "Textile trade is heavily regulated with country-of-origin rules and preferential trade agreements. Anti-dumping duties are common.", keyProducts: "cotton, silk, wool, synthetic fabrics, clothing" },
  XV: { overview: "Section XV covers base metals including iron, steel, aluminum, and copper.", tradeNote: "Steel and aluminum tariffs are among the most politically significant trade measures. Anti-dumping and countervailing duties are frequently applied.", keyProducts: "steel, aluminum, copper, zinc, tools, fasteners" },
  XVI: { overview: "Section XVI covers machinery, electrical equipment, and electronics — the highest value trade category.", tradeNote: "Electronics and machinery represent the largest share of global trade. Export controls may apply to dual-use technology.", keyProducts: "computers, smartphones, semiconductors, engines, turbines" },
  XVII: { overview: "Section XVII covers vehicles, aircraft, and vessels — major capital goods.", tradeNote: "Automotive tariffs vary widely (0% to 25%+). Electric vehicles face rapidly evolving tariff policies worldwide.", keyProducts: "cars, trucks, aircraft, ships, bicycles, parts" },
};

export interface TariffAnalysis {
  summary: string;
  sectionOverview: string;
  tradeNote: string;
  classificationTip: string;
  relatedSearches: string[];
  faqs: { question: string; answer: string }[];
}

export function analyzeHSCode(code: HSCode, section: Section | undefined): TariffAnalysis {
  const ctx = section ? sectionContext[section.id] : null;
  const formattedCode = code.level === 6
    ? `${code.hscode.slice(0, 4)}.${code.hscode.slice(4)}`
    : code.level === 4
    ? `${code.hscode.slice(0, 2)}.${code.hscode.slice(2)}`
    : code.hscode;

  const levelName = code.level === 2 ? "chapter" : code.level === 4 ? "heading" : "subheading";
  const desc = code.description.replace(/;/g, ',');

  // Summary
  const summary = `HS Code ${formattedCode} classifies "${desc}" under ${section ? `Section ${section.id} (${section.name})` : 'the Harmonized System'}. This ${levelName}-level code is used internationally for customs classification, tariff determination, and trade statistics.`;

  // Classification tip
  let classificationTip = `When classifying goods under HS ${formattedCode}, ensure the product matches the specific description. `;
  if (code.level === 2) {
    classificationTip += `As a chapter-level code, this is a broad category. You'll need to narrow down to a 4-digit heading or 6-digit subheading for customs declaration.`;
  } else if (code.level === 4) {
    classificationTip += `This is a heading-level code. For customs declaration, you may need the more specific 6-digit subheading. Check with your national customs authority for additional digits required.`;
  } else {
    classificationTip += `This 6-digit subheading is the international standard. Most countries add 2-4 additional digits for national tariff lines. Check your destination country's tariff schedule for the full code.`;
  }

  // Related searches
  const relatedSearches = [
    `HS code for ${desc.split(',')[0].toLowerCase().trim()}`,
    `import duty for ${desc.split(',')[0].toLowerCase().trim()}`,
    `${formattedCode} tariff rate`,
    `how to classify ${desc.split(',')[0].toLowerCase().trim()}`,
  ];

  // FAQs
  const faqs: { question: string; answer: string }[] = [
    { question: `What is HS Code ${formattedCode}?`, answer: summary },
    { question: `What products fall under HS ${formattedCode}?`, answer: `HS Code ${formattedCode} covers: ${desc}. ${code.level < 6 ? 'This is a broad category that includes more specific subcategories. Browse the child codes below for detailed product classifications.' : 'This is a specific product classification used for customs declarations worldwide.'}` },
    { question: `How do I use HS Code ${formattedCode} for customs?`, answer: classificationTip },
    ...(ctx ? [{ question: `What are the trade regulations for ${section?.name}?`, answer: ctx.tradeNote }] : []),
    { question: `Is HS ${formattedCode} the same in every country?`, answer: `The first 6 digits of HS codes are standardized worldwide by the World Customs Organization (WCO). However, most countries add additional digits (8-10 total) for their national tariff schedules. Always verify the full code with your destination country's customs authority.` },
  ];

  return {
    summary,
    sectionOverview: ctx?.overview || "",
    tradeNote: ctx?.tradeNote || "",
    classificationTip,
    relatedSearches,
    faqs,
  };
}
