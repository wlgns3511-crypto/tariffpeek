export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  category: string;
  readingTime: number;
  content: string;
}

const posts: BlogPost[] = [
  {
    slug: "how-tariffs-affect-consumer-prices",
    title: "How US Tariffs Affect What You Pay at the Store",
    description:
      "Tariffs don't just hit importers — they flow directly to consumers. Learn how tariff incidence works, which product categories cost you the most, and how to check if your goods are tariffed.",
    publishedAt: "2024-10-15",
    updatedAt: "2025-01-10",
    category: "Tariff Basics",
    readingTime: 6,
    content: `
<h2>Who Actually Pays the Tariff?</h2>
<p>There is a persistent myth that tariffs are paid by foreign exporters. In reality, <strong>the importer of record — a US company — pays the tariff</strong> when goods clear US Customs. That cost is then almost always passed downstream to distributors, retailers, and ultimately consumers.</p>
<p>Economists call this "tariff incidence." Studies from the Federal Reserve Bank of New York and the National Bureau of Economic Research consistently found that the 2018–2019 Section 301 tariffs on Chinese goods were passed through to US retail prices at nearly a 1:1 ratio — meaning consumers absorbed essentially 100% of the cost.</p>

<h2>The $831-Per-Household Estimate</h2>
<p>A widely cited 2019 analysis by economists Amiti, Redding, and Weinstein estimated that US households paid an additional <strong>$831 per year</strong> on average due to tariffs imposed during the first wave of the US-China trade war. Lower-income households were hit proportionally harder because they spend a larger share of income on goods (vs. services).</p>
<p>That estimate covers direct price increases on imported goods and indirect increases on domestically produced goods that compete with imports (domestic producers can raise prices when import competition is reduced by tariffs).</p>

<h2>Which Categories Are Hit Hardest?</h2>
<p>Not all products are tariffed equally. The categories with the largest tariff-driven price increases include:</p>
<ul>
  <li><strong>Steel and aluminum</strong> — Section 232 tariffs of 25% on steel and 10% on aluminum raised prices for anything made from these metals: appliances, cars, canned food, construction materials.</li>
  <li><strong>Consumer electronics</strong> — Laptops, smartphones, and networking equipment faced 7.5–25% tariffs under Section 301 List 3 and List 4A.</li>
  <li><strong>Clothing and footwear</strong> — These categories already had high baseline MFN rates (some shoes face duties of 20–37.5%) and additional Section 301 rates pushed costs higher.</li>
  <li><strong>Home appliances</strong> — Washing machines had a dedicated safeguard tariff (up to 50% on large residential washers in 2018) that directly raised retail prices.</li>
  <li><strong>Solar panels</strong> — Section 201 safeguard tariffs starting at 30% affected solar module prices, slowing residential solar adoption.</li>
</ul>

<h2>Supply Chain Complexity and Trade Diversion</h2>
<p>Tariffs on China pushed some production to Vietnam, Bangladesh, Mexico, and other countries. This "trade diversion" partially offset costs for importers who were able to source elsewhere. However, re-tooling supply chains takes years and carries its own costs (new tooling, quality control, logistics infrastructure).</p>
<p>The result: price increases were not uniform. Products with flexible supply chains (garments, electronics assembly) saw smaller price impacts over time. Products with geographically concentrated production (rare earth-dependent electronics, specialized industrial parts) saw larger sustained increases.</p>

<h2>How to Check If Your Product Is Tariffed</h2>
<p>Every product imported into the US is classified under a 10-digit <strong>Harmonized Tariff Schedule (HTS) code</strong>. The applicable duty rate — including any Section 301 or Section 232 additional duties — is listed in the HTS schedule.</p>
<ol>
  <li>Use our <a href="/search/">TariffPeek search</a> to find your product's HTS code and current duty rate.</li>
  <li>Check column 1 (General/MFN rate) for the standard duty.</li>
  <li>Look for "Additional duties" or "Chapter 99" references for Section 301 tariffs on Chinese-origin goods.</li>
  <li>The total duty = base MFN rate + any additional Section 301 rate.</li>
</ol>
<p>For a $500 product from China with a 15% MFN rate and 25% Section 301 rate, total duties are 40% — meaning $200 in duties on that single shipment.</p>

<h2>Conclusion</h2>
<p>Tariffs are a tax on imports paid by US businesses and consumers. Understanding which products carry the heaviest tariff burdens helps businesses make informed sourcing decisions and helps consumers understand why certain goods cost more than they used to. Use TariffPeek to look up current rates before making sourcing or purchasing decisions.</p>
`,
  },
  {
    slug: "hts-codes-explained",
    title: "HTS Codes Explained: How to Classify Your Imports Correctly",
    description:
      "The Harmonized Tariff Schedule uses 10-digit codes to classify every product imported into the US. Learn the code structure, how to find your product's correct code, and why misclassification is a serious customs violation.",
    publishedAt: "2024-10-22",
    updatedAt: "2025-01-12",
    category: "Import Basics",
    readingTime: 7,
    content: `
<h2>What Is the Harmonized Tariff Schedule?</h2>
<p>The <strong>Harmonized Tariff Schedule of the United States (HTSUS)</strong> is a comprehensive list of duty rates for every product that can be imported into the US. It is maintained by the US International Trade Commission (USITC) and updated periodically to reflect new trade agreements, product categories, and policy changes.</p>
<p>The HTS is based on the international <strong>Harmonized System (HS)</strong> — a 6-digit classification system developed by the World Customs Organization (WCO) and used by 200+ countries. The US adds 4 additional digits (making it 10 digits total) for more granular statistical and duty purposes.</p>

<h2>Understanding the 10-Digit Code Structure</h2>
<p>Every HTS code follows this hierarchy:</p>
<table>
  <thead>
    <tr><th>Digits</th><th>Level</th><th>Example</th><th>Meaning</th></tr>
  </thead>
  <tbody>
    <tr><td>1–2</td><td>Chapter</td><td>62</td><td>Articles of apparel (not knitted)</td></tr>
    <tr><td>3–4</td><td>Heading</td><td>6201</td><td>Men's overcoats, car coats, etc.</td></tr>
    <tr><td>5–6</td><td>Subheading (HS)</td><td>620111</td><td>Men's overcoats of wool</td></tr>
    <tr><td>7–8</td><td>US Tariff Item</td><td>62011110</td><td>Further specification</td></tr>
    <tr><td>9–10</td><td>Statistical Suffix</td><td>6201111010</td><td>US-only statistical breakdown</td></tr>
  </tbody>
</table>
<p>The first 6 digits are internationally standardized — a product classified as 6201.11 in the US has the same HS subheading in Europe, Japan, and China. The last 4 digits are US-specific.</p>

<h2>How to Find Your Product's HTS Code</h2>
<p>There are several methods to identify the correct HTS code:</p>
<h3>1. Use TariffPeek Search</h3>
<p>Our <a href="/search/">search tool</a> lets you search by keyword or product description and returns matching HTS codes with their current duty rates.</p>
<h3>2. Browse the USITC HTS Database</h3>
<p>The USITC maintains the official HTS at hts.usitc.gov. You can navigate the chapter structure or search by keyword.</p>
<h3>3. Check CBP's CROSS Rulings Database</h3>
<p>CBP's CROSS (Customs Ruling Online Search System) contains thousands of formal classification rulings. If someone imported a similar product, there may already be a ruling. Rulings carry significant weight — if your product matches a ruling, following that classification is defensible.</p>
<h3>4. Consult a Licensed Customs Broker</h3>
<p>For complex or high-value shipments, a licensed customs broker can provide professional classification advice. Fees typically range from $75–$250 for a classification analysis.</p>

<h2>Why Misclassification Is a Serious Violation</h2>
<p>Using the wrong HTS code — whether intentionally or accidentally — is considered a <strong>customs violation</strong> under 19 U.S.C. § 1592. Penalties vary based on the level of culpability:</p>
<ul>
  <li><strong>Negligence</strong>: Up to 4x the unpaid duties (maximum 20% of the merchandise value)</li>
  <li><strong>Gross negligence</strong>: Up to 4x unpaid duties (maximum 40% of merchandise value)</li>
  <li><strong>Fraud</strong>: Up to the full domestic value of the merchandise</li>
</ul>
<p>In addition, you may owe back duties plus interest, and repeated violations can trigger enhanced examination of future shipments.</p>

<h2>Getting a Binding Ruling</h2>
<p>If you regularly import a product and want certainty about its classification, you can request a <strong>binding ruling</strong> from CBP (Customs and Border Protection). The process:</p>
<ol>
  <li>Submit a ruling request to CBP's National Commodity Specialist Division</li>
  <li>Provide a detailed product description, technical specs, intended use, and samples if possible</li>
  <li>CBP typically responds within 30 days</li>
  <li>The ruling binds CBP to that classification for your specific product</li>
</ol>
<p>A binding ruling provides legal certainty and protection from retroactive duty assessments — a valuable tool for high-volume importers.</p>

<h2>Summary</h2>
<p>Correct HTS classification is the foundation of compliant importing. Take the time to research your product's code thoroughly, consult CBP's CROSS database, and consider a binding ruling for ongoing imports. Use TariffPeek to quickly look up HTS codes and current duty rates for any product.</p>
`,
  },
  {
    slug: "calculate-import-duties-guide",
    title: "How to Calculate the True Cost of Importing Goods to the US",
    description:
      "Import duties aren't just one line item. Learn how to calculate dutiable value, MPF, HMF, broker fees, and total landed cost with a worked example using real numbers.",
    publishedAt: "2024-11-05",
    category: "Import Basics",
    readingTime: 6,
    content: `
<h2>The Components of Import Cost</h2>
<p>When calculating the true cost of importing goods to the US, the duty rate is only one factor. A complete landed cost calculation includes:</p>
<ul>
  <li><strong>Customs duty</strong> — the percentage-based tariff on the dutiable value</li>
  <li><strong>Merchandise Processing Fee (MPF)</strong> — assessed by CBP on every formal entry</li>
  <li><strong>Harbor Maintenance Fee (HMF)</strong> — assessed on ocean and air shipments through US ports</li>
  <li><strong>Customs broker fee</strong> — paid to your licensed customs broker for filing the entry</li>
  <li><strong>Freight and insurance</strong> — may or may not be included in dutiable value depending on Incoterms</li>
</ul>

<h2>Step 1: Determine Dutiable Value</h2>
<p>Customs duties are calculated on the <strong>customs value</strong>, which is normally the <strong>transaction value</strong> — the price actually paid or payable for the goods. Under most Incoterms:</p>
<ul>
  <li><strong>FOB terms</strong>: Customs value = FOB price (excludes freight and insurance to US destination)</li>
  <li><strong>CIF terms</strong>: You still use FOB value for US customs purposes — the US does not include cost of freight and insurance in dutiable value (unlike many other countries)</li>
</ul>
<p>Assists (tooling, molds, design work you provided to the foreign manufacturer), royalties, and related-party transaction adjustments can increase the dutiable value. Work with a customs broker if any of these apply.</p>

<h2>Step 2: Calculate the Customs Duty</h2>
<p>Duty = Dutiable Value × Duty Rate</p>
<p>The duty rate comes from the HTS code. For example, if your product (HTS 8471.30) has a 0% MFN rate but a 25% Section 301 additional duty on Chinese-origin goods, the effective rate is 25%.</p>

<h2>Step 3: Add the Merchandise Processing Fee (MPF)</h2>
<p>The MPF is <strong>0.3464%</strong> of the cargo's value, with:</p>
<ul>
  <li>Minimum: <strong>$32.71</strong> per entry</li>
  <li>Maximum: <strong>$614.35</strong> per entry</li>
</ul>
<p>The MPF applies to formal entries (goods valued over $2,500, or regulated goods at any value). Goods from USMCA-qualifying countries (Mexico, Canada) are exempt from MPF if they meet the rules of origin.</p>

<h2>Step 4: Add the Harbor Maintenance Fee (HMF)</h2>
<p>The HMF is <strong>0.125%</strong> of the cargo's value and applies to commercial cargo entering the US through a port of entry by ocean vessel (including most containerized imports). Air shipments are generally exempt.</p>

<h2>Step 5: Add Broker and Other Fees</h2>
<p>A licensed customs broker will charge for filing your entry, typically:</p>
<ul>
  <li>Basic entry filing: $75–$150</li>
  <li>ISF filing: $25–$50</li>
  <li>Miscellaneous (bond, document handling): $50–$100</li>
</ul>

<h2>Worked Example</h2>
<p>Let's calculate the import cost for a shipment of <strong>$10,000 worth of laptop computers from China</strong>:</p>
<table>
  <thead>
    <tr><th>Item</th><th>Rate</th><th>Amount</th></tr>
  </thead>
  <tbody>
    <tr><td>Dutiable value (FOB)</td><td>—</td><td>$10,000.00</td></tr>
    <tr><td>Customs duty (HTS 8471.30: 0% MFN + 25% Section 301)</td><td>25%</td><td>$2,500.00</td></tr>
    <tr><td>MPF (0.3464%, max $614.35)</td><td>0.3464%</td><td>$34.64</td></tr>
    <tr><td>HMF (ocean shipment, 0.125%)</td><td>0.125%</td><td>$12.50</td></tr>
    <tr><td>Broker fee (estimate)</td><td>flat</td><td>$200.00</td></tr>
    <tr><td><strong>Total import cost</strong></td><td></td><td><strong>$2,747.14</strong></td></tr>
    <tr><td><strong>Total landed cost</strong></td><td></td><td><strong>$12,747.14</strong></td></tr>
  </tbody>
</table>
<p>In this example, tariffs and fees add 27.5% to the cost of goods. That number must be baked into your pricing, margin calculations, and product viability analysis before you commit to a sourcing deal.</p>

<h2>Use TariffPeek to Look Up Your Duty Rate</h2>
<p>Before importing, use our <a href="/search/">HTS code search</a> to find your product's classification and applicable duty rate. Then run the math above for an accurate landed cost estimate. You can also <a href="/compare/">compare rates across product categories</a> to see how tariffs differ by product type and country of origin.</p>
`,
  },
  {
    slug: "china-tariffs-2024-status",
    title: "US-China Tariffs in 2024: Current Status and What's Changed",
    description:
      "From the 2018 Section 301 tariffs to Biden's 2024 EV and solar expansions, here is a comprehensive overview of where US-China tariffs stand and how businesses have adapted.",
    publishedAt: "2024-11-18",
    updatedAt: "2025-02-01",
    category: "Trade Policy",
    readingTime: 7,
    content: `
<h2>How It Started: Section 301 Tariffs (2018–2019)</h2>
<p>The current era of US-China tariffs began in 2018 when the Trump administration imposed <strong>Section 301 tariffs</strong> under the Trade Act of 1974, citing China's unfair trade practices including forced technology transfer and intellectual property theft.</p>
<p>The tariffs were applied in four lists (tranches):</p>
<table>
  <thead>
    <tr><th>List</th><th>Value of Goods</th><th>Tariff Rate</th><th>Effective Date</th></tr>
  </thead>
  <tbody>
    <tr><td>List 1</td><td>~$34 billion</td><td>25%</td><td>July 2018</td></tr>
    <tr><td>List 2</td><td>~$16 billion</td><td>25%</td><td>August 2018</td></tr>
    <tr><td>List 3</td><td>~$200 billion</td><td>10% → 25%</td><td>Sep 2018 → May 2019</td></tr>
    <tr><td>List 4A</td><td>~$120 billion</td><td>7.5%</td><td>September 2019</td></tr>
  </tbody>
</table>
<p>List 4B was temporarily suspended as part of the Phase One trade deal signed in January 2020.</p>

<h2>Section 232: Steel and Aluminum</h2>
<p>Separately from Section 301, the Trump administration also imposed <strong>Section 232 tariffs</strong> on steel (25%) and aluminum (10%) from most countries including China, citing national security concerns. These tariffs remain in effect and have raised costs for manufacturers across construction, automotive, packaging, and appliance sectors.</p>

<h2>Biden Administration: Continuation and Expansion</h2>
<p>The Biden administration retained all Section 301 tariffs following a statutory four-year review. In May 2024, the administration announced significant <strong>new tariff increases</strong> on strategic sectors:</p>
<ul>
  <li><strong>Electric vehicles (EVs)</strong>: 100% (up from 25%)</li>
  <li><strong>Solar cells</strong>: 50% (up from 25%)</li>
  <li><strong>Lithium-ion batteries</strong>: 25% (up from 7.5%) by 2026</li>
  <li><strong>Steel and aluminum</strong>: 25% (maintained)</li>
  <li><strong>Ship-to-shore cranes</strong>: 25% (new)</li>
  <li><strong>Medical products (syringes, PPE)</strong>: 25–100% increases</li>
</ul>
<p>These increases were framed around protecting US industrial policy investments in EVs, clean energy, and semiconductors made under the Inflation Reduction Act and CHIPS Act.</p>

<h2>Exclusion Process</h2>
<p>Throughout the tariff regime, USTR has administered an <strong>exclusion process</strong> allowing companies to apply for temporary exemptions from Section 301 tariffs on specific products. Exclusions are typically granted when:</p>
<ul>
  <li>The product is not reasonably available from US sources or non-Chinese sources</li>
  <li>The tariff causes severe economic harm to the applicant</li>
</ul>
<p>Exclusions must be renewed periodically and are not guaranteed. Companies should check the USTR's current list of active exclusions before assuming their product is covered.</p>

<h2>How Businesses Have Adapted</h2>
<p>Six-plus years of elevated tariffs have reshaped supply chains:</p>
<ul>
  <li><strong>Vietnam</strong> emerged as the primary alternative for electronics assembly and garments</li>
  <li><strong>Mexico</strong> gained share in automotive parts, appliances, and light manufacturing</li>
  <li><strong>India and Bangladesh</strong> absorbed textile and garment production</li>
  <li><strong>Transshipment risks</strong>: CBP has significantly increased enforcement against goods fraudulently routed through third countries to avoid Section 301 duties</li>
</ul>
<p>For importers, the key takeaway is that country of origin matters enormously. Goods substantially transformed in Vietnam may not carry China tariffs — but "minimal operations" (simply relabeling or minor processing) do not confer a new origin.</p>

<h2>What to Expect</h2>
<p>US-China trade policy remains a bipartisan issue. The tariff framework established in 2018 is now deeply embedded in US trade law, and no administration has moved to broadly reverse it. Importers should plan for elevated China tariffs as a long-term structural reality, not a temporary policy. Use <a href="/search/">TariffPeek</a> to look up current rates by HTS code and see which additional duties apply to Chinese-origin goods.</p>
`,
  },
  {
    slug: "first-time-importer-guide",
    title: "First-Time Importer Guide: Everything You Need to Know",
    description:
      "Importing goods to the US for the first time? From ISF filings to customs bonds to de minimis thresholds, here is a complete guide to getting your first shipment through customs.",
    publishedAt: "2024-12-01",
    updatedAt: "2025-01-20",
    category: "Import Basics",
    readingTime: 8,
    content: `
<h2>Before Your Goods Leave the Factory</h2>
<p>US customs compliance begins before your goods are even loaded onto a ship. Here's what to set up in advance:</p>

<h2>Importer Security Filing (ISF): The 24-Hour Rule</h2>
<p>For ocean shipments to the US, you must file an <strong>Importer Security Filing (ISF)</strong> — also called "10+2" — with CBP <strong>at least 24 hours before the goods are loaded onto a vessel</strong> bound for the US.</p>
<p>The ISF requires 10 data elements from the importer (seller, buyer, manufacturer, ship-to party, HTS codes, container stuffing location, and others) plus 2 from the carrier. Failure to file on time carries penalties up to $5,000 per violation. Your customs broker can handle ISF filing for $25–$50.</p>

<h2>Customs Bond</h2>
<p>Any formal customs entry (goods valued over $2,500, or regulated goods at any value) requires a <strong>customs bond</strong>. The bond guarantees that you will pay any duties, taxes, and fees owed to CBP.</p>
<p>Two types:</p>
<ul>
  <li><strong>Single-entry bond</strong>: Covers one shipment. Cost is typically 0.5% of the shipment value, minimum ~$50. Good for occasional importers.</li>
  <li><strong>Continuous bond</strong>: Annual bond covering all entries, typically $500/year. Required if you import more than a few shipments per year. Required to have a carnet for certain goods.</li>
</ul>

<h2>The Role of a Customs Broker</h2>
<p>A <strong>licensed customs broker</strong> is authorized by CBP to act on your behalf to file entry documents, pay duties, and communicate with CBP. For first-time importers, using a broker is strongly recommended.</p>
<p>Brokers charge per shipment (typically $100–$300 for routine formal entries) and save you from costly mistakes. They also handle ISF filing, keep up with regulatory changes, and can advise on HTS classification.</p>

<h2>CBP Entry Types</h2>
<p>Customs entries are categorized by value and type of goods:</p>
<ul>
  <li><strong>Informal entry</strong>: For goods valued under $2,500. Simpler paperwork, no bond required in most cases.</li>
  <li><strong>Formal entry</strong>: Required for goods valued over $2,500. Full documentation, bond required.</li>
  <li><strong>Informal consumption entry (Type 11)</strong>: Most common for commercial shipments under $2,500.</li>
  <li><strong>Formal consumption entry (Type 01)</strong>: Most common for commercial shipments over $2,500.</li>
</ul>

<h2>Required Documents</h2>
<p>For a standard formal entry, you will need:</p>
<ul>
  <li><strong>Commercial invoice</strong> — must include seller, buyer, description of goods, HTS codes, quantity, unit price, total value, and country of origin</li>
  <li><strong>Packing list</strong> — details contents of each carton or pallet</li>
  <li><strong>Bill of lading (ocean) or air waybill (air)</strong> — the transport contract and proof of shipment</li>
  <li><strong>Arrival notice</strong> — issued by the carrier upon arrival at the US port</li>
</ul>
<p>Additional documents may be required for regulated goods: FDA registration for food/cosmetics/medical devices, EPA compliance for engines and vehicles, CPSC certificates of conformity for consumer products, etc.</p>

<h2>De Minimis: The $800 Threshold</h2>
<p>Goods valued at <strong>$800 or less</strong> can generally enter the US duty-free under the de minimis provision (Section 321). This threshold covers individual shipments sent directly to a US consumer. Commercial importers cannot use de minimis for bulk shipments — it is designed for B2C e-commerce and personal imports.</p>
<p>Note: Section 301 tariffs on Chinese-origin goods have an exception — even goods under $800 that are subject to Section 301 List 1–4 tariffs are NOT exempt under de minimis (starting 2024 enforcement).</p>

<h2>Anti-Dumping and Countervailing Duties</h2>
<p>Beyond normal tariffs, some products are subject to <strong>anti-dumping (AD) or countervailing duty (CVD) orders</strong> that can add hundreds of percent in additional duties. These apply to specific products from specific countries where CBP has determined goods were sold below cost (dumping) or received unfair government subsidies.</p>
<p>Always check for AD/CVD orders on your product before importing. Unexpected AD/CVD liability has blindsided importers with bills for thousands of dollars per shipment. Your customs broker can check for existing orders.</p>

<h2>Summary Checklist for First-Time Importers</h2>
<ol>
  <li>Get your Importer of Record (IOR) number (your EIN or SSN)</li>
  <li>Find your HTS code — use <a href="/search/">TariffPeek</a></li>
  <li>Calculate expected duties and fees before ordering</li>
  <li>Hire a licensed customs broker</li>
  <li>Get a continuous bond if you plan to import regularly</li>
  <li>File ISF 24 hours before vessel loading</li>
  <li>Prepare accurate commercial invoice and packing list</li>
  <li>Check for AD/CVD orders on your product</li>
</ol>
`,
  },
];

export function getAllPosts(): BlogPost[] {
  return posts;
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllCategories(): string[] {
  return [...new Set(posts.map((p) => p.category))];
}
