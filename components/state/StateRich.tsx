import type { StateTradeData } from "@/lib/states-data";
import type { StateFacts } from "@/lib/state-facts";
import { partnerToSlug } from "@/lib/state-facts";

interface Props {
  slug: string;
  state: StateTradeData;
  facts: StateFacts;
  narrative: string;
}

const FLAG: Record<string, string> = {
  china: "\u{1F1E8}\u{1F1F3}", japan: "\u{1F1EF}\u{1F1F5}", korea: "\u{1F1F0}\u{1F1F7}",
  eu: "\u{1F1EA}\u{1F1FA}", canada: "\u{1F1E8}\u{1F1E6}", mexico: "\u{1F1F2}\u{1F1FD}",
  brazil: "\u{1F1E7}\u{1F1F7}", uk: "\u{1F1EC}\u{1F1E7}", india: "\u{1F1EE}\u{1F1F3}",
  australia: "\u{1F1E6}\u{1F1FA}", vietnam: "\u{1F1FB}\u{1F1F3}", thailand: "\u{1F1F9}\u{1F1ED}",
  taiwan: "\u{1F1F9}\u{1F1FC}", indonesia: "\u{1F1EE}\u{1F1E9}", turkey: "\u{1F1F9}\u{1F1F7}",
  singapore: "\u{1F1F8}\u{1F1EC}", uae: "\u{1F1E6}\u{1F1EA}", "saudi-arabia": "\u{1F1F8}\u{1F1E6}",
  "south-africa": "\u{1F1FF}\u{1F1E6}",
};

export function StateRich({ slug, state, facts, narrative }: Props) {
  const BASE_URL = "https://tariffpeek.com";

  // Schema.org Dataset
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${state.name} International Trade Data`,
    description: `Trade profile for ${state.name}: ${state.importVolume} imports, ${state.exportVolume} exports, ${facts.portCount} major ports, top partners include ${state.topTradePartners.slice(0, 3).join(", ")}. Sources: US Census Bureau Foreign Trade Statistics, USITC DataWeb.`,
    url: `${BASE_URL}/state/${slug}/`,
    creator: { "@type": "Organization", name: "US Census Bureau" },
    temporalCoverage: "2024/2025",
    spatialCoverage: { "@type": "Place", name: state.name },
    variableMeasured: [
      { "@type": "PropertyValue", name: "Annual Import Volume", value: state.importVolume },
      { "@type": "PropertyValue", name: "Annual Export Volume", value: state.exportVolume },
      { "@type": "PropertyValue", name: "Major Ports", value: state.majorPorts.join(", ") },
      { "@type": "PropertyValue", name: "Top Trade Partner", value: facts.topPartner },
    ],
  };

  // FAQ
  const faqs = [
    {
      question: `What are ${state.name}'s largest imports?`,
      answer: `${state.name}'s top imports are ${state.topImports.slice(0, 3).join(", ")}. Total annual imports are ${state.importVolume}, primarily through ${state.majorPorts[0]}.`,
    },
    {
      question: `Which countries does ${state.name} trade with most?`,
      answer: `${state.name}'s top trading partners are ${state.topTradePartners.join(", ")}. ${facts.topPartner} leads in trade volume.`,
    },
    {
      question: `What are the major ports in ${state.name}?`,
      answer: `${state.name} has ${facts.portCount} major trade gateway${facts.portCount > 1 ? "s" : ""}: ${state.majorPorts.join(", ")}. These handle both imports (${state.importVolume}) and exports (${state.exportVolume}).`,
    },
    {
      question: `What does ${state.name} export?`,
      answer: `${state.name}'s top exports include ${state.topExports.slice(0, 3).join(", ")}, totaling ${state.exportVolume} annually. ${facts.isExporter ? `${state.name} is a net exporter — exports exceed imports.` : `Imports exceed exports in ${state.name}.`}`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Layer 2: Trade Profile Narrative */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-bold text-slate-900 mb-2">{state.name} Trade Profile</h2>
        <p className="text-sm text-slate-700 leading-relaxed">{narrative}</p>
      </section>

      {/* Trade Partners → Country Tariff Cross-links */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">Tariff Rates for {state.name}&apos;s Trade Partners</h2>
        <p className="text-sm text-slate-500 mb-3">
          View import tariff rates for {state.name}&apos;s top trading partners.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {state.topTradePartners.map((partner, i) => {
            const cs = partnerToSlug(partner);
            if (!cs) return (
              <div key={partner} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-600">
                <span className="text-xs text-slate-400">#{i + 1}</span> {partner}
              </div>
            );
            return (
              <a
                key={partner}
                href={`/import/${cs}/`}
                className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800 font-medium hover:border-blue-400 transition-colors"
              >
                <span className="text-xs text-blue-500">#{i + 1}</span> {FLAG[cs] || ""} {partner}
                <span className="block text-xs text-blue-600 mt-0.5">View tariff rates &rarr;</span>
              </a>
            );
          })}
        </div>
      </section>

      {/* Import/Export Data Table */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-3">{state.name} Trade at a Glance</h2>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-3 font-medium">Metric</th>
                <th className="text-right p-3 font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100">
                <td className="p-3 text-slate-700">Annual Imports</td>
                <td className="text-right p-3 font-semibold text-indigo-700">{state.importVolume}</td>
              </tr>
              <tr className="border-t border-slate-100 bg-slate-50/50">
                <td className="p-3 text-slate-700">Annual Exports</td>
                <td className="text-right p-3 font-semibold text-emerald-700">{state.exportVolume}</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="p-3 text-slate-700">Trade Balance</td>
                <td className="text-right p-3 font-semibold">{facts.isExporter ?
                  <span className="text-emerald-700">Net exporter</span> :
                  <span className="text-indigo-700">Net importer</span>
                }</td>
              </tr>
              <tr className="border-t border-slate-100 bg-slate-50/50">
                <td className="p-3 text-slate-700">Major Ports / Entry Points</td>
                <td className="text-right p-3">{facts.portCount}</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="p-3 text-slate-700">Top Trade Partner</td>
                <td className="text-right p-3 font-medium">{facts.topPartner}</td>
              </tr>
              <tr className="border-t border-slate-100 bg-slate-50/50">
                <td className="p-3 text-slate-700">#1 Import Category</td>
                <td className="text-right p-3">{facts.topImport}</td>
              </tr>
              <tr className="border-t border-slate-100">
                <td className="p-3 text-slate-700">#1 Export Category</td>
                <td className="text-right p-3">{facts.topExport}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-400 mt-2">Source: US Census Bureau Foreign Trade Statistics, USITC DataWeb.</p>
      </section>

      {/* FAQ */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
        {faqs.map((faq, i) => (
          <details key={i} className="border border-slate-200 rounded-lg mb-2" open={i === 0}>
            <summary className="p-4 cursor-pointer font-medium hover:bg-slate-50">{faq.question}</summary>
            <div className="px-4 pb-4 text-slate-600 text-sm">{faq.answer}</div>
          </details>
        ))}
      </section>
    </>
  );
}
