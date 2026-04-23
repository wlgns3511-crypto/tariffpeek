/**
 * Auto-generated FAQs for HS code pages using real tariff data values.
 */
import { formatHSCode, levelLabel } from './format';

export interface FAQItem {
  question: string;
  answer: string;
}

interface HSCodeData {
  hscode: string;
  slug: string;
  description: string;
  level: number;
  chapter: string | null;
  section: string | null;
  us_avg_duty: number | null;
  us_duty_range: string | null;
  us_duty_notes: string | null;
  us_fta_notes: string | null;
}

export function generateAutoFAQs(
  code: HSCodeData,
  globalAvgDuty: number,
  chapterAvgDuty: number,
  childCount: number,
  hasFtaOptions: boolean,
): FAQItem[] {
  return [];
}
