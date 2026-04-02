interface InsightCardsProps {
  dutyRate: number;
  globalAvg: number;
  chapterAvg: number;
  chapter: string | null;
  rank: number;
  total: number;
  hasFta: boolean;
}

function getDutyTier(rate: number) {
  if (rate === 0) return { label: "Duty-Free", border: "border-emerald-200", bg: "bg-emerald-50", text: "text-emerald-700" };
  if (rate <= 3) return { label: "Low Duty", border: "border-green-200", bg: "bg-green-50", text: "text-green-700" };
  if (rate <= 8) return { label: "Moderate Duty", border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700" };
  if (rate <= 15) return { label: "High Duty", border: "border-orange-200", bg: "bg-orange-50", text: "text-orange-700" };
  return { label: "Very High Duty", border: "border-red-200", bg: "bg-red-50", text: "text-red-700" };
}

export function InsightCards({ dutyRate, globalAvg, chapterAvg, chapter, rank, total, hasFta }: InsightCardsProps) {
  const tier = getDutyTier(dutyRate);
  const globalDiff = dutyRate - globalAvg;
  const chapterDiff = dutyRate - chapterAvg;
  const costPer1000 = Math.round(dutyRate * 10);
  const topPct = total > 0 ? Math.round((rank / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Duty Tier */}
      <div className={`rounded-xl border p-4 ${tier.border} ${tier.bg}`}>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Duty Rate Tier</div>
        <div className={`text-2xl font-bold ${tier.text} mb-1`}>{dutyRate}%</div>
        <p className="text-sm text-slate-600 leading-snug">
          {tier.label}. Adds ${costPer1000} per $1,000 of declared value.
        </p>
      </div>

      {/* vs Global Avg */}
      <div className={`rounded-xl border p-4 ${globalDiff > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">vs Global Average</div>
        <div className={`text-2xl font-bold ${globalDiff > 0 ? 'text-red-700' : 'text-green-700'} mb-1`}>
          {globalDiff > 0 ? '+' : ''}{globalDiff.toFixed(1)}pp
        </div>
        <p className="text-sm text-slate-600 leading-snug">
          {Math.abs(globalDiff).toFixed(1)}pp {globalDiff > 0 ? 'above' : 'below'} the global average duty of {globalAvg}%.
        </p>
      </div>

      {/* vs Chapter Avg */}
      {chapter ? (
        <div className={`rounded-xl border p-4 ${chapterDiff > 0 ? 'border-orange-200 bg-orange-50' : 'border-emerald-200 bg-emerald-50'}`}>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">vs Chapter {chapter} Avg</div>
          <div className={`text-2xl font-bold ${chapterDiff > 0 ? 'text-orange-700' : 'text-emerald-700'} mb-1`}>
            {chapterDiff > 0 ? '+' : ''}{chapterDiff.toFixed(1)}pp
          </div>
          <p className="text-sm text-slate-600 leading-snug">
            {Math.abs(chapterDiff).toFixed(1)}pp {chapterDiff > 0 ? 'above' : 'below'} the chapter average of {chapterAvg}%.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border p-4 border-slate-200 bg-slate-50">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Duty Rank</div>
          <div className="text-2xl font-bold text-slate-700 mb-1">#{rank}</div>
          <p className="text-sm text-slate-600 leading-snug">
            Top {topPct}% highest tariff rate out of {total.toLocaleString()} HS codes.
          </p>
        </div>
      )}

      {/* Trade Category */}
      <div className={`rounded-xl border p-4 ${hasFta ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">FTA Eligibility</div>
        <div className={`text-2xl font-bold ${hasFta ? 'text-blue-700' : 'text-slate-700'} mb-1`}>
          {hasFta ? 'Eligible' : 'Standard'}
        </div>
        <p className="text-sm text-slate-600 leading-snug">
          {hasFta ? 'FTA preferences may reduce or eliminate this duty rate.' : 'Standard MFN rates apply. No special FTA preferences noted.'}
        </p>
      </div>
    </div>
  );
}
