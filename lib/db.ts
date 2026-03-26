import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'tariff.db');
let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) _db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
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
