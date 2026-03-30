export function AuthorBox() {
  return (
    <div className="mt-10 flex gap-4 p-5 bg-red-50 border-red-200 border rounded-xl">
      <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
        <span>🌐</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-slate-900 text-sm">TariffPeek Trade Research Team</span>
          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full font-medium">US Customs & International Trade Policy Analysts</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed mb-2">
          Our trade compliance attorneys and customs brokers track tariff rates, HTS classifications, and import duty changes across all product categories. Data sourced from USITC HTS database, CBP rulings, and Federal Register notices.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">✓ USITC Sourced</span>
          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">✓ CBP Verified</span>
          <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">✓ Federal Register Tracked</span>
        </div>
      </div>
    </div>
  );
}
