/**
 * Import/Export required documents by HS chapter and product type.
 * Data covers US import requirements (CBP, FDA, USDA, EPA, etc.)
 */

export interface RequiredDocument {
  name: string;
  description: string;
  agency: string;
  required: boolean; // true = mandatory, false = may be required
}

// Universal documents required for ALL US imports
export const universalDocs: RequiredDocument[] = [
  { name: "Commercial Invoice", description: "Detailed invoice from the seller showing product description, quantity, unit price, total value, and terms of sale (Incoterms).", agency: "CBP", required: true },
  { name: "Packing List", description: "Itemized list of contents in each package, including weights, dimensions, and marks/numbers matching the shipping containers.", agency: "CBP", required: true },
  { name: "Bill of Lading (B/L) or Airway Bill", description: "Transport document issued by the carrier confirming receipt of goods for shipment. Acts as a contract of carriage and receipt.", agency: "Carrier", required: true },
  { name: "CBP Entry Summary (Form 7501)", description: "The formal customs declaration filed with US Customs and Border Protection for all commercial imports.", agency: "CBP", required: true },
  { name: "Importer Security Filing (ISF/10+2)", description: "Must be filed at least 24 hours before ocean cargo is loaded. Required for all ocean shipments to the US.", agency: "CBP", required: true },
  { name: "Customs Bond", description: "A financial guarantee ensuring payment of duties, taxes, and fees. Required for commercial shipments over $2,500.", agency: "CBP", required: true },
];

// Chapter-specific additional documents
const chapterDocs: Record<string, RequiredDocument[]> = {
  // Live animals
  "01": [
    { name: "USDA/APHIS Import Permit", description: "Required for importing live animals. Application must be submitted before shipment.", agency: "USDA", required: true },
    { name: "Health Certificate", description: "Veterinary health certificate from the country of origin confirming the animal is disease-free.", agency: "USDA", required: true },
    { name: "Quarantine Clearance", description: "Animals may be subject to quarantine upon arrival at designated USDA facilities.", agency: "USDA", required: false },
  ],
  // Meat
  "02": [
    { name: "FSIS Import Inspection", description: "All meat products must be inspected by USDA Food Safety and Inspection Service at the port of entry.", agency: "USDA/FSIS", required: true },
    { name: "Foreign Meat Inspection Certificate", description: "Certificate from an approved foreign inspection system confirming the meat meets US standards.", agency: "USDA", required: true },
    { name: "Country Eligibility Verification", description: "Only meat from FSIS-approved countries/establishments may enter the US.", agency: "USDA/FSIS", required: true },
  ],
  // Fish
  "03": [
    { name: "FDA Prior Notice", description: "All food imports require prior notice to FDA before arrival. Filed electronically.", agency: "FDA", required: true },
    { name: "NOAA/NMFS Import Monitoring", description: "Certain seafood species require additional documentation under the Seafood Import Monitoring Program (SIMP).", agency: "NOAA", required: false },
    { name: "Lacey Act Declaration", description: "Required for certain fish and wildlife products to combat illegal trade.", agency: "FWS", required: false },
  ],
  // Dairy
  "04": [
    { name: "FDA Prior Notice", description: "All food imports require electronic prior notice to FDA before arrival.", agency: "FDA", required: true },
    { name: "Milk Import Act Permit", description: "Required for importing milk, cream, and certain dairy products into the US.", agency: "FDA", required: true },
    { name: "Tariff-Rate Quota License", description: "Many dairy products are subject to TRQs. An import license may be needed for in-quota rates.", agency: "USDA/FAS", required: false },
  ],
  // Vegetables
  "07": [
    { name: "USDA Phytosanitary Certificate", description: "Certificate from the exporting country confirming plants are pest-free.", agency: "USDA/APHIS", required: true },
    { name: "FDA Prior Notice", description: "Electronic prior notice required for all food shipments.", agency: "FDA", required: true },
    { name: "USDA Import Permit", description: "Required for certain fruits and vegetables depending on country of origin.", agency: "USDA", required: false },
  ],
  // Fruits
  "08": [
    { name: "USDA Phytosanitary Certificate", description: "Required to prevent introduction of plant pests. Must be issued by exporting country's NPPO.", agency: "USDA/APHIS", required: true },
    { name: "FDA Prior Notice", description: "Electronic prior notice required for all food imports.", agency: "FDA", required: true },
    { name: "Cold Treatment Certificate", description: "Some fruits require cold treatment during transit to kill fruit flies.", agency: "USDA", required: false },
  ],
  // Pharmaceuticals
  "30": [
    { name: "FDA Drug Registration", description: "Drug establishments must be registered with FDA. Foreign manufacturers need a US Agent.", agency: "FDA", required: true },
    { name: "FDA Drug Listing", description: "All commercially marketed drugs must be listed with the FDA.", agency: "FDA", required: true },
    { name: "DEA Import Permit", description: "Required for controlled substances (Schedule I-V). Apply at least 4 weeks before import.", agency: "DEA", required: false },
    { name: "Certificate of Pharmaceutical Product (CPP)", description: "WHO-format certificate confirming the product is authorized in the country of origin.", agency: "FDA", required: false },
  ],
  // Chemicals
  "28": [
    { name: "TSCA Import Certification", description: "Certify that imported chemicals comply with the Toxic Substances Control Act.", agency: "EPA", required: true },
    { name: "Safety Data Sheet (SDS)", description: "16-section document describing chemical hazards, handling, and emergency procedures.", agency: "OSHA", required: true },
    { name: "EPA Notification", description: "New chemical substances may require EPA pre-manufacture notification.", agency: "EPA", required: false },
  ],
  "29": [
    { name: "TSCA Import Certification", description: "Required for organic chemical imports under the Toxic Substances Control Act.", agency: "EPA", required: true },
    { name: "Safety Data Sheet (SDS)", description: "Hazard communication document required for all chemical products.", agency: "OSHA", required: true },
  ],
  // Plastics
  "39": [
    { name: "TSCA Import Certification", description: "Certification of compliance with EPA's Toxic Substances Control Act.", agency: "EPA", required: true },
  ],
  // Textiles & Apparel
  "61": [
    { name: "Textile Declaration (CBP Form 6059B)", description: "Country of origin and fiber content declaration required for all textile imports.", agency: "CBP", required: true },
    { name: "Certificate of Origin", description: "Required to determine applicable duty rate and FTA eligibility.", agency: "CBP", required: true },
    { name: "CPSC Compliance Certificate", description: "Children's apparel must comply with flammability standards and lead content limits.", agency: "CPSC", required: false },
  ],
  "62": [
    { name: "Textile Declaration", description: "Fiber content, country of origin, and manufacturer identification required.", agency: "CBP", required: true },
    { name: "Certificate of Origin", description: "Determines duty rate and FTA eligibility. Critical for preferential treatment.", agency: "CBP", required: true },
    { name: "CPSC Certificate", description: "Required for children's clothing (flammability, lead, phthalates testing).", agency: "CPSC", required: false },
  ],
  // Footwear
  "64": [
    { name: "Country of Origin Marking", description: "All footwear must be clearly marked with country of origin.", agency: "CBP", required: true },
    { name: "CPSC Certificate", description: "Children's footwear must meet lead content and other safety standards.", agency: "CPSC", required: false },
  ],
  // Iron & Steel (Section 232)
  "72": [
    { name: "Section 232 Steel License", description: "ALL steel imports require a license through the Steel Import Monitoring System, regardless of exemptions.", agency: "Commerce", required: true },
    { name: "Certificate of Origin", description: "Critical for determining Section 232 tariff applicability and exclusions.", agency: "CBP", required: true },
    { name: "Section 232 Exclusion Request", description: "Importers can request exclusion from 25% tariff for specific products not available domestically.", agency: "Commerce", required: false },
  ],
  "73": [
    { name: "Section 232 Steel License", description: "Required for articles of iron or steel. Monitor via the Steel Import Monitoring System.", agency: "Commerce", required: true },
  ],
  // Aluminum (Section 232)
  "76": [
    { name: "Section 232 Aluminum License", description: "ALL aluminum imports require a license through the Aluminum Import Monitoring System.", agency: "Commerce", required: true },
    { name: "Certificate of Origin", description: "Determines Section 232 tariff applicability. USMCA countries may have different treatment.", agency: "CBP", required: true },
  ],
  // Machinery
  "84": [
    { name: "FCC Declaration of Conformity", description: "Required for electronic/electrical equipment that may emit radio frequency energy.", agency: "FCC", required: false },
    { name: "UL/NRTL Certification", description: "Safety certification for electrical equipment. Not legally required but practically necessary for sale.", agency: "OSHA/NRTL", required: false },
    { name: "Energy Star / DOE Compliance", description: "Certain appliances must meet Department of Energy efficiency standards.", agency: "DOE", required: false },
  ],
  // Electronics
  "85": [
    { name: "FCC Equipment Authorization", description: "Required for electronic devices that emit RF energy (phones, WiFi devices, Bluetooth).", agency: "FCC", required: true },
    { name: "UL Safety Certification", description: "Safety testing/certification for electrical products sold in the US market.", agency: "UL/NRTL", required: false },
    { name: "EPA Energy Star", description: "Voluntary certification but increasingly expected for consumer electronics.", agency: "EPA", required: false },
  ],
  // Vehicles
  "87": [
    { name: "EPA Certificate of Conformity", description: "All motor vehicles must meet EPA emission standards. Certification required before import.", agency: "EPA", required: true },
    { name: "DOT/NHTSA Compliance", description: "Vehicles must comply with Federal Motor Vehicle Safety Standards (FMVSS).", agency: "DOT/NHTSA", required: true },
    { name: "HS-7 Declaration Form", description: "Filed with CBP declaring vehicle compliance with safety and emission standards.", agency: "CBP", required: true },
    { name: "EPA Form 3520-1", description: "Vehicle/engine import declaration for EPA emission compliance.", agency: "EPA", required: true },
  ],
  // Toys
  "95": [
    { name: "CPSC Children's Product Certificate (CPC)", description: "Required for all children's products. Must be based on third-party testing.", agency: "CPSC", required: true },
    { name: "Third-Party Lab Test Report", description: "CPSIA-accredited lab testing for lead, phthalates, and toy safety standards (ASTM F963).", agency: "CPSC", required: true },
    { name: "Tracking Label", description: "Permanent, distinguishing mark on product and packaging for traceability.", agency: "CPSC", required: true },
  ],
  // Arms
  "93": [
    { name: "ATF Import Permit (Form 6)", description: "Required from Bureau of Alcohol, Tobacco, Firearms and Explosives before importing.", agency: "ATF", required: true },
    { name: "State Department License", description: "Defense articles require an import license from the Directorate of Defense Trade Controls.", agency: "State/DDTC", required: true },
  ],
  // Alcohol
  "22": [
    { name: "TTB Import Permit", description: "Alcohol and Tobacco Tax and Trade Bureau permit required for importing alcoholic beverages.", agency: "TTB", required: true },
    { name: "FDA Prior Notice", description: "All food/beverage imports require electronic prior notice.", agency: "FDA", required: true },
    { name: "Certificate of Label Approval (COLA)", description: "TTB must approve all labels before alcoholic beverages can be sold in the US.", agency: "TTB", required: true },
    { name: "State Alcohol Import License", description: "Many states require additional licensing for alcohol imports.", agency: "State", required: false },
  ],
  // Tobacco
  "24": [
    { name: "TTB Permit", description: "Required from Alcohol and Tobacco Tax and Trade Bureau.", agency: "TTB", required: true },
    { name: "FDA Tobacco Registration", description: "All tobacco product importers must register with FDA.", agency: "FDA", required: true },
    { name: "Warning Label Compliance", description: "Cigarette packages must bear Surgeon General's warning labels.", agency: "FDA", required: true },
  ],
};

// FTA Certificate of Origin info
export const ftaCertificates: Record<string, string> = {
  USMCA: "USMCA Certificate of Origin — self-certification by importer, exporter, or producer. No prescribed format.",
  KORUS: "Korea-US FTA Certificate of Origin — can be issued by importer, exporter, or producer.",
  CAFTA_DR: "CAFTA-DR Certificate of Origin — CBP Form 3013. Must be completed by exporter.",
  Australia: "Australia FTA Certificate of Origin — self-certification allowed.",
  Chile: "Chile FTA Certificate of Origin — prescribed format required.",
  Colombia: "Colombia TPA Certificate of Origin — self-certification by importer, exporter, or producer.",
  Peru: "Peru TPA Certificate of Origin — similar to Colombia TPA format.",
  Japan: "US-Japan Trade Agreement — limited product coverage, self-certification.",
};

/**
 * Get required documents for a given HS chapter
 */
export function getRequiredDocs(chapter: string): {
  universal: RequiredDocument[];
  specific: RequiredDocument[];
  ftaInfo: string[];
} {
  const specific = chapterDocs[chapter] || [];

  // Determine relevant FTAs based on chapter
  const ftaInfo: string[] = [];
  ftaInfo.push(ftaCertificates.USMCA);
  ftaInfo.push(ftaCertificates.KORUS);
  if (["61", "62", "63", "64"].includes(chapter)) {
    ftaInfo.push(ftaCertificates.CAFTA_DR);
  }

  return {
    universal: universalDocs,
    specific,
    ftaInfo: ftaInfo.slice(0, 3),
  };
}
