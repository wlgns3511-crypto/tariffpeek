/**
 * Shared content helpers — slug-hash variant selection + formatters.
 * Ported from nameblooms/costbycity pattern for HCU template-detection avoidance.
 */

/** Deterministic variant picker based on slug hash (no randomness). */
export function pickVariant<T>(slug: string, variants: T[]): T {
  let h = 0;
  for (let i = 0; i < slug.length; i++) {
    h = ((h << 5) - h + slug.charCodeAt(i)) | 0;
  }
  return variants[Math.abs(h) % variants.length];
}

/** Slot picker — picks variant for a named slot within the same page. */
export function pickSlot<T>(slug: string, slot: string, variants: T[]): T {
  return pickVariant(`${slug}::${slot}`, variants);
}

export function fmtPct(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

export function fmtNum(n: number): string {
  return n.toLocaleString("en-US");
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function ratioPhrase(a: number, b: number): string {
  if (b === 0) return "significantly higher";
  const r = a / b;
  if (r >= 3) return `about ${Math.round(r)} times`;
  if (r >= 2) return `more than double`;
  if (r >= 1.5) return `roughly 1.5 times`;
  if (r >= 1.2) return `about ${Math.round(r * 10) / 10} times`;
  if (r >= 0.8) return `roughly comparable to`;
  if (r >= 0.5) return `about half`;
  return `a fraction of`;
}
