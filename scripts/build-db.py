#!/usr/bin/env python3
"""Build tariff-peek SQLite database from HS code CSV data."""

import csv
import re
import sqlite3
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(SCRIPT_DIR, "../data/tariff.db")
HS_CSV = "/tmp/hs-codes.csv"

def slugify(text):
    s = text.lower().strip()
    s = re.sub(r'[^a-z0-9\s-]', '', s)
    s = re.sub(r'[\s]+', '-', s)
    s = re.sub(r'-+', '-', s)
    return s[:80].strip('-')

def main():
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")

    conn.execute("""
        CREATE TABLE codes (
            hscode TEXT PRIMARY KEY,
            description TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            section TEXT,
            parent TEXT,
            level INTEGER,
            chapter TEXT,
            heading TEXT
        )
    """)

    conn.execute("""
        CREATE TABLE sections (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            chapter_range TEXT
        )
    """)

    conn.execute("CREATE INDEX idx_codes_slug ON codes(slug)")
    conn.execute("CREATE INDEX idx_codes_section ON codes(section)")
    conn.execute("CREATE INDEX idx_codes_parent ON codes(parent)")
    conn.execute("CREATE INDEX idx_codes_level ON codes(level)")
    conn.execute("CREATE INDEX idx_codes_chapter ON codes(chapter)")

    # Section definitions
    sections = {
        "I": ("Live Animals; Animal Products", "01-05"),
        "II": ("Vegetable Products", "06-14"),
        "III": ("Animal or Vegetable Fats and Oils", "15"),
        "IV": ("Prepared Foodstuffs; Beverages, Spirits, Tobacco", "16-24"),
        "V": ("Mineral Products", "25-27"),
        "VI": ("Products of Chemical or Allied Industries", "28-38"),
        "VII": ("Plastics and Rubber", "39-40"),
        "VIII": ("Raw Hides, Skins, Leather, Furskins", "41-43"),
        "IX": ("Wood and Articles of Wood; Cork; Straw", "44-46"),
        "X": ("Pulp of Wood; Paper and Paperboard", "47-49"),
        "XI": ("Textiles and Textile Articles", "50-63"),
        "XII": ("Footwear, Headgear, Umbrellas", "64-67"),
        "XIII": ("Articles of Stone, Plaster, Cement, Ceramics, Glass", "68-70"),
        "XIV": ("Natural or Cultured Pearls, Precious Stones, Metals", "71"),
        "XV": ("Base Metals and Articles of Base Metal", "72-83"),
        "XVI": ("Machinery and Mechanical Appliances; Electrical Equipment", "84-85"),
        "XVII": ("Vehicles, Aircraft, Vessels, Transport Equipment", "86-89"),
        "XVIII": ("Optical, Photographic, Measuring, Medical Instruments", "90-92"),
        "XIX": ("Arms and Ammunition", "93"),
        "XX": ("Miscellaneous Manufactured Articles", "94-96"),
        "XXI": ("Works of Art, Collectors' Pieces and Antiques", "97"),
    }

    for sid, (name, chapters) in sections.items():
        conn.execute(
            "INSERT INTO sections VALUES (?, ?, ?, ?)",
            (sid, name, slugify(name), chapters)
        )

    # Parse HS codes
    inserted = 0
    seen_slugs = set()

    with open(HS_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            hscode = row["hscode"].strip()
            desc = row["description"].strip()
            section = row["section"].strip()
            parent = row.get("parent", "").strip()
            level = int(row.get("level", 0))

            if not hscode or not desc:
                continue

            # Generate slug
            slug = slugify(f"{hscode}-{desc}")
            if not slug or slug in seen_slugs:
                slug = slugify(f"{hscode}-{desc[:40]}")
            if slug in seen_slugs:
                slug = f"{hscode}-{slugify(desc[:30])}"
            if slug in seen_slugs:
                continue
            seen_slugs.add(slug)

            # Determine chapter and heading
            chapter = hscode[:2] if len(hscode) >= 2 else hscode
            heading = hscode[:4] if len(hscode) >= 4 else hscode

            try:
                conn.execute(
                    "INSERT INTO codes VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (hscode, desc, slug, section, parent, level, chapter, heading)
                )
                inserted += 1
            except sqlite3.IntegrityError:
                pass

    conn.commit()

    # Stats
    total = conn.execute("SELECT COUNT(*) FROM codes").fetchone()[0]
    sections_count = conn.execute("SELECT COUNT(*) FROM sections").fetchone()[0]
    chapters = conn.execute("SELECT COUNT(DISTINCT chapter) FROM codes WHERE level = 2").fetchone()[0]

    print(f"✅ Database built: {DB_PATH}")
    print(f"   Codes: {total}")
    print(f"   Sections: {sections_count}")
    print(f"   Chapters: {chapters}")

    conn.close()

if __name__ == "__main__":
    main()
