"use client";
import { useState, useMemo } from "react";

interface Props {
  defaultTariffRate: number;
  hsCode: string;
}

interface CostBreakdown {
  productValue: number;
  duty: number;
  shipping: number;
  insurance: number;
  brokerage: number;
  otherFees: number;
  total: number;
}

const COLORS = ["#f59e0b", "#d97706", "#b45309", "#92400e", "#78350f", "#451a03"];

function formatUSD(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

export function LandedCostCalculator({ defaultTariffRate, hsCode }: Props) {
  const [open, setOpen] = useState(false);
  const [productValue, setProductValue] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [tariffRate, setTariffRate] = useState(String(defaultTariffRate));
  const [insurancePct, setInsurancePct] = useState("0.5");
  const [brokerage, setBrokerage] = useState("150");
  const [otherFees, setOtherFees] = useState("0");
  const [quantity, setQuantity] = useState("");

  const breakdown = useMemo<CostBreakdown | null>(() => {
    const pv = parseFloat(productValue);
    const sc = parseFloat(shippingCost) || 0;
    const tr = parseFloat(tariffRate) || 0;
    const ip = parseFloat(insurancePct) || 0;
    const bf = parseFloat(brokerage) || 0;
    const of_ = parseFloat(otherFees) || 0;

    if (!pv || pv <= 0) return null;

    const duty = pv * (tr / 100);
    const insurance = pv * (ip / 100);
    const total = pv + duty + sc + insurance + bf + of_;

    return { productValue: pv, duty, shipping: sc, insurance, brokerage: bf, otherFees: of_, total };
  }, [productValue, shippingCost, tariffRate, insurancePct, brokerage, otherFees]);

  const qty = parseFloat(quantity) || 0;

  const chartItems = useMemo(() => {
    if (!breakdown) return [];
    const items = [
      { label: "Product (FOB)", value: breakdown.productValue, color: COLORS[0] },
      { label: "Duty", value: breakdown.duty, color: COLORS[1] },
      { label: "Shipping", value: breakdown.shipping, color: COLORS[2] },
      { label: "Insurance", value: breakdown.insurance, color: COLORS[3] },
      { label: "Brokerage", value: breakdown.brokerage, color: COLORS[4] },
      { label: "Other Fees", value: breakdown.otherFees, color: COLORS[5] },
    ].filter((i) => i.value > 0);
    return items;
  }, [breakdown]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full mt-6 p-4 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl hover:bg-amber-100 hover:border-amber-400 transition-colors cursor-pointer text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🧮</span>
          <div>
            <p className="font-semibold text-amber-900">Total Landed Cost Calculator</p>
            <p className="text-sm text-amber-700">Estimate the full import cost including duty ({defaultTariffRate}%), shipping, insurance, and fees</p>
          </div>
          <span className="ml-auto text-amber-500 text-xl">→</span>
        </div>
      </button>
    );
  }

  return (
    <section className="mt-6 border border-amber-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-amber-50 px-5 py-4 flex items-center justify-between border-b border-amber-200">
        <div>
          <h2 className="text-lg font-bold text-amber-900">Total Landed Cost Calculator</h2>
          <p className="text-xs text-amber-600">HS {hsCode} — Estimate your total import cost</p>
        </div>
        <button onClick={() => setOpen(false)} className="text-sm text-amber-500 hover:text-amber-700 cursor-pointer">Close</button>
      </div>

      <div className="p-5">
        {/* Inputs */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <InputField label="Product Value (FOB)" value={productValue} onChange={setProductValue} prefix="$" placeholder="10,000" />
          <InputField label="Shipping Cost" value={shippingCost} onChange={setShippingCost} prefix="$" placeholder="500" />
          <InputField label="Tariff Rate" value={tariffRate} onChange={setTariffRate} suffix="%" placeholder={String(defaultTariffRate)} />
          <InputField label="Insurance" value={insurancePct} onChange={setInsurancePct} suffix="% of value" placeholder="0.5" />
          <InputField label="Customs Brokerage Fee" value={brokerage} onChange={setBrokerage} prefix="$" placeholder="150" />
          <InputField label="Other Fees" value={otherFees} onChange={setOtherFees} prefix="$" placeholder="0" />
          <InputField label="Quantity (optional)" value={quantity} onChange={setQuantity} placeholder="e.g. 100" />
        </div>

        {/* Results */}
        {breakdown && (
          <div className="space-y-5">
            {/* Total */}
            <div className="bg-amber-50 rounded-lg p-4 text-center border border-amber-200">
              <p className="text-sm text-amber-700 mb-1">Total Landed Cost</p>
              <p className="text-3xl font-bold text-amber-900">{formatUSD(breakdown.total)}</p>
              {qty > 0 && (
                <p className="text-sm text-amber-600 mt-1">
                  {formatUSD(breakdown.total / qty)} per unit ({qty} units)
                </p>
              )}
            </div>

            {/* Breakdown Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 border-b border-slate-200">
                <span className="text-sm font-semibold text-slate-700">Cost Breakdown</span>
              </div>
              <BreakdownRow label="Product Value (FOB)" amount={breakdown.productValue} pct={breakdown.productValue / breakdown.total * 100} />
              <BreakdownRow label="Import Duty" amount={breakdown.duty} pct={breakdown.duty / breakdown.total * 100} highlight />
              <BreakdownRow label="Shipping" amount={breakdown.shipping} pct={breakdown.shipping / breakdown.total * 100} />
              <BreakdownRow label="Insurance" amount={breakdown.insurance} pct={breakdown.insurance / breakdown.total * 100} />
              <BreakdownRow label="Customs Brokerage" amount={breakdown.brokerage} pct={breakdown.brokerage / breakdown.total * 100} />
              {breakdown.otherFees > 0 && (
                <BreakdownRow label="Other Fees" amount={breakdown.otherFees} pct={breakdown.otherFees / breakdown.total * 100} />
              )}
              <div className="flex justify-between p-3 bg-amber-50 font-bold border-t border-slate-200">
                <span className="text-sm text-amber-900">Total Landed Cost</span>
                <span className="text-sm text-amber-900">{formatUSD(breakdown.total)}</span>
              </div>
            </div>

            {/* Bar Chart */}
            <div>
              <p className="text-sm font-semibold text-slate-700 mb-2">Cost Distribution</p>
              <div className="flex h-8 rounded-lg overflow-hidden border border-slate-200">
                {chartItems.map((item) => {
                  const pct = (item.value / breakdown.total) * 100;
                  return (
                    <div
                      key={item.label}
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                      className="relative group"
                      title={`${item.label}: ${formatUSD(item.value)} (${pct.toFixed(1)}%)`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                {chartItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
                    {item.label} ({((item.value / breakdown.total) * 100).toFixed(1)}%)
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with high-CPC keywords */}
      <div className="px-5 py-4 bg-slate-50 border-t border-slate-200">
        <p className="text-xs text-slate-400 leading-relaxed">
          Need help importing? Compare <strong>customs brokerage services</strong>, get <strong>freight forwarding quotes</strong>,
          secure <strong>cargo insurance</strong>, and find competitive <strong>international shipping rates</strong> for HS {hsCode} products.
        </p>
      </div>
    </section>
  );
}

/* ── Sub-components ── */

function InputField({
  label, value, onChange, prefix, suffix, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-amber-300 focus-within:border-amber-300">
        {prefix && <span className="px-2.5 text-sm text-slate-400 bg-slate-50 border-r border-slate-200 py-2">{prefix}</span>}
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 text-sm outline-none bg-white"
        />
        {suffix && <span className="px-2.5 text-sm text-slate-400 bg-slate-50 border-l border-slate-200 py-2">{suffix}</span>}
      </div>
    </div>
  );
}

function BreakdownRow({ label, amount, pct, highlight }: { label: string; amount: number; pct: number; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-3 border-b border-slate-100 ${highlight ? "bg-red-50" : ""}`}>
      <span className={`text-sm ${highlight ? "font-semibold text-red-700" : "text-slate-700"}`}>{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400 w-12 text-right">{pct.toFixed(1)}%</span>
        <span className={`text-sm font-medium w-24 text-right ${highlight ? "text-red-700" : ""}`}>{formatUSD(amount)}</span>
      </div>
    </div>
  );
}
