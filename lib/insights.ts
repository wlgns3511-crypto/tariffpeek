/**
 * HS code tariff insights based on WCO/USITC data.
 * Compares duty rates against global and chapter averages,
 * surfaces FTA savings opportunities and classification guidance.
 */

export interface Insight {
  text: string;
  sentiment?: "positive" | "negative" | "neutral";
}

interface CodeData {
  hscode: string;
  description: string;
  us_avg_duty: number | null;
  us_duty_range: string | null;
  us_fta_notes: string | null;
  chapter: string | null;
  level: number;
}

export function getTariffInsights(
  code: CodeData,
  globalAvg: number,
  chapterAvg: number,
  rank: number,
  total: number,
  hasFta: boolean,
): Insight[] {
  const insights: Insight[] = [];

  // 1. Duty rate vs chapter average
  if (code.us_avg_duty != null) {
    const diff = code.us_avg_duty - chapterAvg;
    if (diff > 3) {
      insights.push({
        text: `Duty rate of ${code.us_avg_duty.toFixed(2)}% is ${diff.toFixed(1)} points above the chapter average (${chapterAvg.toFixed(2)}%). This product category faces above-average tariff burden.`,
        sentiment: "negative",
      });
    } else if (diff < -3) {
      insights.push({
        text: `Duty rate of ${code.us_avg_duty.toFixed(2)}% is ${Math.abs(diff).toFixed(1)} points below the chapter average (${chapterAvg.toFixed(2)}%). Relatively favorable tariff treatment within this product group.`,
        sentiment: "positive",
      });
    } else {
      insights.push({
        text: `Duty rate of ${code.us_avg_duty.toFixed(2)}% is near the chapter average of ${chapterAvg.toFixed(2)}% — typical for this product category.`,
        sentiment: "neutral",
      });
    }
  }

  // 2. FTA savings potential
  if (hasFta && code.us_avg_duty != null && code.us_avg_duty > 0) {
    insights.push({
      text: `Free trade agreement preferences may reduce or eliminate the ${code.us_avg_duty.toFixed(2)}% duty. On a $100K shipment, full FTA elimination saves $${(code.us_avg_duty * 1000).toFixed(0)}.`,
      sentiment: "positive",
    });
  } else if (!hasFta && code.us_avg_duty != null && code.us_avg_duty > 5) {
    insights.push({
      text: `No FTA preferences noted for this code. The full ${code.us_avg_duty.toFixed(2)}% MFN rate applies regardless of origin country — consider sourcing strategy.`,
      sentiment: "negative",
    });
  }

  // 3. Duty rank among all codes
  if (code.us_avg_duty != null) {
    const percentile = ((total - rank) / total) * 100;
    if (percentile > 80) {
      insights.push({
        text: `Ranked #${rank} of ${total.toLocaleString()} codes by duty rate — in the top ${(100 - percentile).toFixed(0)}% highest tariff rates across all HS codes.`,
        sentiment: "negative",
      });
    } else if (percentile < 30) {
      insights.push({
        text: `Ranked #${rank} of ${total.toLocaleString()} codes — one of the lower-duty classifications, favorable for import cost planning.`,
        sentiment: "positive",
      });
    }
  }

  // 4. Classification level specificity
  if (code.level <= 4) {
    insights.push({
      text: `This is a ${code.level}-digit heading — a broad category. Actual duty depends on the specific 6-10 digit subheading. Drill into sub-classifications for precise rates.`,
      sentiment: "neutral",
    });
  } else if (code.level >= 8) {
    insights.push({
      text: `This ${code.level}-digit code is highly specific. The duty rate shown should closely match your actual import rate. Verify on USITC HTS for the binding classification.`,
      sentiment: "positive",
    });
  }

  // 5. Duty range spread
  if (code.us_duty_range && code.us_avg_duty != null) {
    insights.push({
      text: `Duty range for sub-classifications: ${code.us_duty_range}. Wide ranges mean the exact product description matters — misclassification risk is higher when the spread is large.`,
      sentiment: "neutral",
    });
  }

  return insights.slice(0, 5);
}
