import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'tariff.db');
let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) {
    try {
      _db.prepare('SELECT 1').get();
      return _db;
    } catch {
      _db = null;
    }
  }
  _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
  return _db;
}

export interface HSCode {
  hscode: string;
  description: string;
  slug: string;
  section: string | null;
  parent: string | null;
  level: number;
  chapter: string | null;
  heading: string | null;
  us_avg_duty: number | null;
  us_duty_range: string | null;
  us_duty_notes: string | null;
  us_fta_notes: string | null;
}

export interface Section {
  id: string;
  name: string;
  slug: string;
  chapter_range: string;
}

export function getAllCodes(): HSCode[] {
  return getDb().prepare('SELECT * FROM codes ORDER BY hscode').all() as HSCode[];
}

export function getCodeBySlug(slug: string): HSCode | undefined {
  return getDb().prepare('SELECT * FROM codes WHERE slug = ?').get(slug) as HSCode | undefined;
}

export function getCodeByHSCode(hscode: string): HSCode | undefined {
  return getDb().prepare('SELECT * FROM codes WHERE hscode = ?').get(hscode) as HSCode | undefined;
}

export function getChildCodes(parentCode: string): HSCode[] {
  return getDb().prepare('SELECT * FROM codes WHERE parent = ? ORDER BY hscode').all(parentCode) as HSCode[];
}

export function getCodesByChapter(chapter: string): HSCode[] {
  return getDb().prepare('SELECT * FROM codes WHERE chapter = ? ORDER BY hscode').all(chapter) as HSCode[];
}

export function getCodesBySection(sectionId: string): HSCode[] {
  return getDb().prepare('SELECT * FROM codes WHERE section = ? AND level = 2 ORDER BY hscode').all(sectionId) as HSCode[];
}

export function getAllSections(): Section[] {
  return getDb().prepare('SELECT * FROM sections ORDER BY id').all() as Section[];
}

export function getSectionById(id: string): Section | undefined {
  return getDb().prepare('SELECT * FROM sections WHERE id = ?').get(id) as Section | undefined;
}

export function searchCodes(query: string, limit = 50): HSCode[] {
  const q = `%${query}%`;
  return getDb().prepare('SELECT * FROM codes WHERE description LIKE ? OR hscode LIKE ? ORDER BY level, hscode LIMIT ?').all(q, q, limit) as HSCode[];
}

export function getTopCodes(limit = 3000): HSCode[] {
  return getDb().prepare('SELECT * FROM codes WHERE level >= 4 ORDER BY hscode LIMIT ?').all(limit) as HSCode[];
}

export function getChapters(): HSCode[] {
  return getDb().prepare('SELECT * FROM codes WHERE level = 2 ORDER BY hscode').all() as HSCode[];
}

export function countCodes(): number {
  return (getDb().prepare('SELECT COUNT(*) as c FROM codes').get() as { c: number }).c;
}

export function getRelatedCodes(hscode: string, limit = 8): HSCode[] {
  const chapter = hscode.substring(0, 2);
  return getDb().prepare('SELECT * FROM codes WHERE chapter = ? AND hscode != ? AND level >= 4 ORDER BY hscode LIMIT ?').all(chapter, hscode, limit) as HSCode[];
}

// ── Country tariff types and queries ──

export interface CountryTariff {
  id: number;
  hs_code: string;
  country_code: string;
  country_name: string;
  country_slug: string;
  mfn_rate: number;
  fta_rate: number | null;
  fta_name: string | null;
  notes: string | null;
}

export interface Country {
  code: string;
  name: string;
  slug: string;
}

export function getAllCountries(): Country[] {
  return getDb().prepare('SELECT * FROM countries ORDER BY name').all() as Country[];
}

export function getCountryBySlug(slug: string): Country | undefined {
  return getDb().prepare('SELECT * FROM countries WHERE slug = ?').get(slug) as Country | undefined;
}

export function getCountryTariff(countrySlug: string, hsCode: string): CountryTariff | undefined {
  return getDb().prepare(
    'SELECT * FROM country_tariffs WHERE country_slug = ? AND hs_code = ?'
  ).get(countrySlug, hsCode) as CountryTariff | undefined;
}

export function getCountryTariffBySlug(countrySlug: string, codeSlug: string): (CountryTariff & { description: string; slug: string; level: number; chapter: string | null; section: string | null }) | undefined {
  return getDb().prepare(`
    SELECT ct.*, c.description, c.slug, c.level, c.chapter, c.section
    FROM country_tariffs ct
    JOIN codes c ON ct.hs_code = c.hscode
    WHERE ct.country_slug = ? AND c.slug = ?
  `).get(countrySlug, codeSlug) as any;
}

export function getTariffsForCountry(countrySlug: string, limit = 100): (CountryTariff & { description: string; slug: string; level: number })[] {
  return getDb().prepare(`
    SELECT ct.*, c.description, c.slug, c.level
    FROM country_tariffs ct
    JOIN codes c ON ct.hs_code = c.hscode
    WHERE ct.country_slug = ? AND c.level >= 4
    ORDER BY ct.mfn_rate DESC
    LIMIT ?
  `).all(countrySlug, limit) as any[];
}

export function getCountryAvgRates(countrySlug: string): { chapter: string; avg_rate: number; description: string }[] {
  return getDb().prepare(`
    SELECT c.chapter, ROUND(AVG(ct.mfn_rate), 1) as avg_rate,
           (SELECT description FROM codes WHERE chapter = c.chapter AND level = 2 LIMIT 1) as description
    FROM country_tariffs ct
    JOIN codes c ON ct.hs_code = c.hscode
    WHERE ct.country_slug = ? AND c.level >= 4
    GROUP BY c.chapter
    ORDER BY avg_rate DESC
  `).all(countrySlug) as any[];
}

export function getCountryOverallAvg(countrySlug: string): number {
  const result = getDb().prepare(
    'SELECT ROUND(AVG(mfn_rate), 1) as avg FROM country_tariffs WHERE country_slug = ?'
  ).get(countrySlug) as { avg: number } | undefined;
  return result?.avg ?? 0;
}

export function getCountryFtaPartners(countrySlug: string): { fta_name: string; count: number }[] {
  return getDb().prepare(`
    SELECT fta_name, COUNT(*) as count
    FROM country_tariffs
    WHERE country_slug = ? AND fta_name IS NOT NULL
    GROUP BY fta_name
    ORDER BY count DESC
  `).all(countrySlug) as any[];
}

export function getAllCountryTariffsForCode(hsCode: string): CountryTariff[] {
  return getDb().prepare(
    'SELECT * FROM country_tariffs WHERE hs_code = ? ORDER BY mfn_rate ASC'
  ).all(hsCode) as CountryTariff[];
}

export function getTopCountryTariffParams(topCodesLimit = 50): { country: string; slug: string }[] {
  const countries = getDb().prepare('SELECT slug FROM countries ORDER BY name').all() as { slug: string }[];
  const topCodes = getDb().prepare('SELECT slug FROM codes WHERE level >= 4 ORDER BY hscode LIMIT ?').all(topCodesLimit) as { slug: string }[];

  const params: { country: string; slug: string }[] = [];
  for (const c of countries) {
    for (const code of topCodes) {
      params.push({ country: c.slug, slug: code.slug });
    }
  }
  return params;
}

export function countCountryTariffs(): number {
  const r = getDb().prepare('SELECT COUNT(*) as c FROM country_tariffs').get() as { c: number } | undefined;
  return r?.c ?? 0;
}

export function getCountryTariffSitemapEntries(limit = 45000): { country_slug: string; code_slug: string }[] {
  return getDb().prepare(`
    SELECT ct.country_slug, c.slug as code_slug
    FROM country_tariffs ct
    JOIN codes c ON ct.hs_code = c.hscode
    WHERE c.level >= 4
    ORDER BY ct.hs_code, ct.country_slug
    LIMIT ?
  `).all(limit) as any[];
}
