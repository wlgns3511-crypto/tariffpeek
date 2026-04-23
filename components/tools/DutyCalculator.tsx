"use client";
import { useState, useMemo } from "react";

interface Props {
  dutyRate: number;
  hasFta: boolean;
  hsCode: string;
  description: string;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

export function DutyCalculator({ dutyRate, hasFta, hsCode, description }: Props) {
  const [goodsValue, setGoodsValue] = useState(5000);
  const [quantity, setQuantity] = useState(1);
  const [useFta, setUseFta] = useState(false);

  const result = useMemo(() => {
    const effectiveRate = useFta && hasFta ? 0 : dutyRate;
    const totalValue = goodsValue * quantity;
    const totalDuty = totalValue * (effectiveRate / 100);
    const perUnitDuty = quantity > 0 ? totalDuty / quantity : 0;
    const landedCost = totalValue + totalDuty;
    const ftaSavings = hasFta ? totalValue * (dutyRate / 100) : 0;

    return { effectiveRate, totalValue, totalDuty, perUnitDuty, landedCost, ftaSavings };
  }, [goodsValue, quantity, dutyRate, hasFta, useFta]);

  const shortDesc = description.length > 40 ? description.substring(0, 40) + "..." : description;

  return (
    <section className="my-8 border border-indigo-200 rounded-xl overflow-hidden">
      <div className="bg-indigo-50 px-5 py-4 border-b border-indigo-200">
        <h2 className="text-lg font-bold text-indigo-900">Import Duty Calculator</h2>
        <p className="text-xs text-indigo-600">HS {hsCode} — {shortDesc}</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Inputs */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Goods Value (per unit)
            </label>
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-300">
              <span className="px-2.5 text-sm text-slate-400 bg-slate-50 border-r border-slate-200 py-2">$</span>
              <input
                type="range"
                min={100}
                max={100000}
                step={100}
                value={goodsValue}
                onChange={(e) => setGoodsValue(Number(e.target.value))}
                className="flex-1 mx-2 accent-indigo-600"
              />
              <span className="px-3 py-2 text-sm font-semibold text-indigo-700 min-w-[80px] text-right">
                {fmt(goodsValue)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>$100</span><span>$100,000</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Quantity
            </label>
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-300">
              <input
                type="range"
                min={1}
                max={1000}
                step={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="flex-1 mx-2 accent-indigo-600"
              />
              <span className="px-3 py-2 text-sm font-semibold text-indigo-700 min-w-[60px] text-right">
                {quantity.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1</span><span>1,000</span>
            </div>
          </div>
        </div>

        {/* FTA Toggle */}
        {hasFta && (
          <label className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={useFta}
              onChange={(e) => setUseFta(e.target.checked)}
              className="accent-green-600 w-4 h-4"
            />
            <div>
              <span className="text-sm font-medium text-green-800">Apply Free Trade Agreement</span>
              <span className="block text-xs text-green-600">Qualifying origins may reduce duty to 0%</span>
            </div>
          </label>
        )}

        {/* Results */}
        <div className="space-y-3">
          {/* Summary sentence */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm text-indigo-900 leading-relaxed">
              Importing <strong>{fmt(result.totalValue)}</strong> worth of{" "}
              <strong>{shortDesc}</strong> incurs{" "}
              <strong>{fmt(result.totalDuty)}</strong> in duties ({result.effectiveRate.toFixed(2)}% rate).
              {useFta && hasFta && " FTA preference applied — duty eliminated."}
            </p>
          </div>

          {/* Breakdown */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="flex justify-between p-3 border-b border-slate-100 bg-slate-50">
              <span className="text-sm text-slate-600">Total Goods Value</span>
              <span className="text-sm font-semibold">{fmt(result.totalValue)}</span>
            </div>
            <div className="flex justify-between p-3 border-b border-slate-100">
              <span className="text-sm text-slate-600">
                Duty Rate {useFta && hasFta ? "(FTA: 0%)" : `(${dutyRate.toFixed(2)}%)`}
              </span>
              <span className={`text-sm font-semibold ${result.totalDuty > 0 ? "text-red-700" : "text-green-700"}`}>
                {fmt(result.totalDuty)}
              </span>
            </div>
            <div className="flex justify-between p-3 border-b border-slate-100 bg-slate-50">
              <span className="text-sm text-slate-600">Per-Unit Duty</span>
              <span className="text-sm font-semibold">{fmt(result.perUnitDuty)}</span>
            </div>
            {hasFta && !useFta && (
              <div className="flex justify-between p-3 border-b border-slate-100 bg-green-50">
                <span className="text-sm text-green-700">Potential FTA Savings</span>
                <span className="text-sm font-bold text-green-700">{fmt(result.ftaSavings)}</span>
              </div>
            )}
            <div className="flex justify-between p-3 bg-indigo-50">
              <span className="text-sm font-bold text-indigo-900">Total Landed Cost</span>
              <span className="text-lg font-bold text-indigo-900">{fmt(result.landedCost)}</span>
            </div>
          </div>

          {/* Visual bar */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">Cost Composition</p>
            <div className="flex h-6 rounded-lg overflow-hidden border border-slate-200">
              <div
                className="bg-indigo-400"
                style={{ width: `${(result.totalValue / result.landedCost) * 100}%` }}
                title={`Goods: ${fmt(result.totalValue)}`}
              />
              <div
                className="bg-red-400"
                style={{ width: `${(result.totalDuty / result.landedCost) * 100}%` }}
                title={`Duty: ${fmt(result.totalDuty)}`}
              />
            </div>
            <div className="flex gap-4 mt-1">
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <span className="w-3 h-3 bg-indigo-400 rounded-sm inline-block" /> Goods
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <span className="w-3 h-3 bg-red-400 rounded-sm inline-block" /> Duty
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
        <p className="text-xs text-slate-400">
          Rates are approximate MFN tariffs. Actual rates may vary by product classification and origin.
          Verify with <a href="https://hts.usitc.gov" className="underline" target="_blank" rel="noopener">USITC</a>.
        </p>
      </div>
    </section>
  );
}
