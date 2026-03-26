#!/usr/bin/env python3
"""Add US MFN tariff rate estimates and FTA info to HS chapters.
Uses well-known tariff ranges for major product categories."""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../data/tariff.db")

# US MFN tariff rates by chapter (approximate ranges from USITC/WTO data)
# Format: (chapter, avg_duty_pct, duty_range, notes, fta_note)
CHAPTER_TARIFFS = [
    ("01", 0.0, "0%", "Live animals generally enter duty-free", "Most FTAs: 0%"),
    ("02", 2.5, "0-26.4%", "Meat: varies by type. Beef 0-26.4%, poultry 0-17.6%", "USMCA: 0% for Canada/Mexico. Korea FTA: phased elimination"),
    ("03", 0.5, "0-15%", "Fish and seafood: mostly low or free", "Most FTAs: 0%"),
    ("04", 8.0, "0-$1.541/kg", "Dairy: complex mix of ad valorem and specific duties. Tariff-rate quotas apply", "USMCA: expanded quotas. EU: TRQ system"),
    ("05", 0.0, "0-3.2%", "Animal products mostly duty-free", "Most FTAs: 0%"),
    ("06", 2.0, "0-6.8%", "Live plants and flowers: low duties", "Most FTAs: 0%"),
    ("07", 4.5, "0-21.3%", "Vegetables: varies seasonally. Some have tariff-rate quotas", "USMCA: 0%. CAFTA-DR: phased reduction"),
    ("08", 3.0, "0-14%", "Fruits and nuts: moderate duties", "Chile FTA: 0%. Peru FTA: 0%"),
    ("09", 0.0, "0-6%", "Coffee and tea: coffee generally free, tea low duty", "Most FTAs: 0%"),
    ("10", 0.5, "0-1.1¢/kg", "Cereals: low duties, some specific rates", "USMCA: 0%"),
    ("11", 1.0, "0-6.4%", "Milling products and starches", "Most FTAs: 0%"),
    ("12", 0.5, "0-6.7%", "Oil seeds: mostly free. Soybeans 0%", "Most FTAs: 0%"),
    ("13", 1.5, "0-5%", "Plant saps and extracts", "Most FTAs: 0%"),
    ("14", 0.0, "0-3.2%", "Vegetable plaiting materials: low", "Most FTAs: 0%"),
    ("15", 3.0, "0-19.1%", "Fats and oils: olive oil 5¢/kg, palm oil free", "Most FTAs: reduced or 0%"),
    ("16", 4.0, "0-35%", "Meat/fish preparations: varies widely", "USMCA: 0%. KORUS: phased"),
    ("17", 6.0, "0-35.74¢/kg", "Sugars: highly protected, TRQ system", "Few FTAs grant full duty-free access"),
    ("18", 2.5, "0-6%", "Cocoa and chocolate preparations", "Most FTAs: 0%"),
    ("19", 4.5, "0-17.5%", "Cereal preparations, pastries, bread", "USMCA: 0%"),
    ("20", 7.0, "0-35%", "Vegetable/fruit preparations: some high duties", "Most FTAs: reduced"),
    ("21", 4.0, "0-10%", "Misc edible preparations, sauces", "Most FTAs: 0%"),
    ("22", 3.0, "0-$13.50/proof liter", "Beverages: beer $0.21/L, wine $0.053-0.264/L, spirits vary", "Australia FTA: 0% wine"),
    ("23", 1.0, "0-5%", "Animal feed and food residues", "Most FTAs: 0%"),
    ("24", 20.0, "0-350%", "Tobacco: very high duties and excise taxes", "Few FTA concessions on tobacco"),
    ("25", 0.0, "0-5%", "Salt, sulfur, earth, stone: mostly free", "Most FTAs: 0%"),
    ("26", 0.0, "Free", "Ores, slag, ash: duty-free", "All FTAs: 0%"),
    ("27", 1.0, "0-52.5¢/bbl", "Mineral fuels, petroleum: crude oil 5.25-10.5¢/bbl", "USMCA: 0%"),
    ("28", 2.5, "0-6.5%", "Inorganic chemicals", "Most FTAs: 0%"),
    ("29", 3.5, "0-6.5%", "Organic chemicals", "Most FTAs: 0%"),
    ("30", 0.0, "0-6%", "Pharmaceuticals: most are duty-free under WTO agreement", "WTO Pharma Agreement: 0%"),
    ("31", 0.0, "0-4.2%", "Fertilizers: mostly free", "Most FTAs: 0%"),
    ("32", 3.0, "0-6.5%", "Dyes, paints, inks", "Most FTAs: 0%"),
    ("33", 3.0, "0-5.8%", "Cosmetics and essential oils", "Most FTAs: 0%"),
    ("34", 3.5, "0-6.5%", "Soap, wax, polishes", "Most FTAs: 0%"),
    ("35", 3.0, "0-6.5%", "Albumins, enzymes, glues", "Most FTAs: 0%"),
    ("36", 4.5, "0-6.5%", "Explosives, matches, pyrotechnics", "Most FTAs: 0%"),
    ("37", 3.0, "0-5%", "Photographic goods", "Most FTAs: 0%"),
    ("38", 3.0, "0-6.5%", "Miscellaneous chemical products", "Most FTAs: 0%"),
    ("39", 3.5, "0-6.5%", "Plastics and articles thereof", "Most FTAs: 0%"),
    ("40", 3.0, "0-4%", "Rubber and articles thereof. Tires: 3-4%", "USMCA: 0% with rules of origin"),
    ("41", 2.0, "0-5%", "Raw hides, skins, leather", "Most FTAs: 0%"),
    ("42", 8.0, "0-20%", "Leather goods, handbags: 5-20%", "KORUS: phased to 0%"),
    ("43", 3.0, "0-5.3%", "Furskins", "Most FTAs: 0%"),
    ("44", 2.0, "0-8%", "Wood and articles of wood", "Most FTAs: 0%"),
    ("45", 0.0, "0-3.2%", "Cork articles", "Most FTAs: 0%"),
    ("46", 3.0, "0-6.6%", "Straw and basketwork", "Most FTAs: 0%"),
    ("47", 0.0, "Free", "Wood pulp: duty-free", "All FTAs: 0%"),
    ("48", 0.5, "0-6%", "Paper and paperboard", "Most FTAs: 0%"),
    ("49", 0.0, "Free", "Printed books, newspapers: duty-free", "All FTAs: 0%"),
    ("50", 3.0, "0-6.6%", "Silk", "Most FTAs: 0%"),
    ("51", 6.0, "0-25%", "Wool and fine animal hair", "Australia FTA: 0%"),
    ("52", 8.0, "0-17.5%", "Cotton and cotton fabrics", "AGOA: 0% for qualifying African countries"),
    ("53", 2.0, "0-4.5%", "Vegetable textile fibers", "Most FTAs: 0%"),
    ("54", 8.0, "0-14.9%", "Man-made filaments", "KORUS: phased. USMCA: with yarn-forward rule"),
    ("55", 8.0, "0-12.5%", "Man-made staple fibers", "Similar to Ch.54"),
    ("56", 5.0, "0-8%", "Wadding, felt, nonwovens", "Most FTAs: 0%"),
    ("57", 4.0, "0-6%", "Carpets and floor coverings", "Most FTAs: 0%"),
    ("58", 5.0, "0-12.5%", "Special woven fabrics, lace", "Most FTAs: 0%"),
    ("59", 5.0, "0-8%", "Coated/impregnated textile fabrics", "Most FTAs: 0%"),
    ("60", 8.0, "0-13.6%", "Knitted or crocheted fabrics", "CAFTA-DR: 0% with TPL"),
    ("61", 15.0, "0-32%", "Knitted apparel: high duties, 12-32%", "USMCA: 0% with yarn-forward. CAFTA: 0% with TPL"),
    ("62", 12.0, "0-28.6%", "Woven apparel: high duties, 8-28.6%", "Similar to Ch.61. Jordan FTA: 0%"),
    ("63", 8.0, "0-14.9%", "Other textile articles, rags", "Most FTAs: reduced"),
    ("64", 12.0, "0-48%", "Footwear: 8-48% depending on material", "KORUS: phased. Vietnam: no FTA (high duty)"),
    ("65", 7.0, "0-8%", "Headgear", "Most FTAs: 0%"),
    ("66", 4.0, "0-8%", "Umbrellas, walking sticks", "Most FTAs: 0%"),
    ("67", 5.0, "0-12%", "Feathers, artificial flowers", "Most FTAs: 0%"),
    ("68", 3.0, "0-6%", "Articles of stone, plaster, cement", "Most FTAs: 0%"),
    ("69", 5.0, "0-11%", "Ceramic products: tiles 8.5%, tableware 6-11%", "Most FTAs: 0%"),
    ("70", 5.0, "0-6.9%", "Glass and glassware", "Most FTAs: 0%"),
    ("71", 4.0, "0-6.5%", "Precious metals, jewelry. Gold/platinum: free", "Most FTAs: 0%"),
    ("72", 0.0, "0-6%", "Iron and steel: many products duty-free. Section 232: 25% additional", "Section 232 tariffs apply to most countries. Exclusions available"),
    ("73", 3.0, "0-8.6%", "Articles of iron or steel", "Most FTAs: 0%"),
    ("74", 2.0, "0-3%", "Copper and articles thereof", "Most FTAs: 0%"),
    ("75", 2.0, "0-3%", "Nickel and articles thereof", "Most FTAs: 0%"),
    ("76", 3.0, "0-6.5%", "Aluminum: Section 232: 10% additional tariff", "Section 232 tariffs apply. USMCA: excluded from 232"),
    ("78", 2.0, "0-4%", "Lead and articles thereof", "Most FTAs: 0%"),
    ("79", 2.0, "0-4.2%", "Zinc and articles thereof", "Most FTAs: 0%"),
    ("80", 0.0, "0-3.5%", "Tin and articles thereof", "Most FTAs: 0%"),
    ("81", 3.0, "0-6.6%", "Other base metals (tungsten, molybdenum etc)", "Most FTAs: 0%"),
    ("82", 3.0, "0-8%", "Tools, cutlery of base metal", "Most FTAs: 0%"),
    ("83", 3.0, "0-7.8%", "Miscellaneous base metal articles", "Most FTAs: 0%"),
    ("84", 2.0, "0-6%", "Machinery: computers 0%, engines 2.5%, turbines 2-3%", "ITA: 0% for many electronics. Most FTAs: 0%"),
    ("85", 2.0, "0-6%", "Electrical equipment: semiconductors 0%, phones 0%, TVs 3.9%", "ITA: 0% for IT products. Most FTAs: 0%"),
    ("86", 2.0, "0-14%", "Railway/tramway equipment", "Most FTAs: 0%"),
    ("87", 2.5, "0-25%", "Vehicles: cars 2.5%, trucks 25%, parts 0-2.5%", "USMCA: 0% with 75% RVC. EU: 2.5%. China: 25% + Section 301"),
    ("88", 0.0, "Free", "Aircraft and spacecraft: duty-free", "WTO Agreement on Trade in Civil Aircraft: 0%"),
    ("89", 0.0, "0-2%", "Ships, boats: mostly free", "Most FTAs: 0%"),
    ("90", 2.0, "0-6.6%", "Optical, medical, measuring instruments", "ITA: 0% for many items. Most FTAs: 0%"),
    ("91", 4.0, "0-6.4%", "Clocks and watches", "Most FTAs: 0%"),
    ("92", 3.0, "0-5.3%", "Musical instruments", "Most FTAs: 0%"),
    ("93", 3.0, "0-7%", "Arms and ammunition", "Few FTA concessions"),
    ("94", 0.0, "0-7%", "Furniture, mattresses, lighting: most 0-3.4%", "Most FTAs: 0%"),
    ("95", 0.0, "0-6.5%", "Toys, games, sports equipment: most 0-3.5%", "Most FTAs: 0%"),
    ("96", 4.0, "0-8%", "Miscellaneous manufactured articles", "Most FTAs: 0%"),
    ("97", 0.0, "Free", "Works of art, collectors pieces: duty-free", "All FTAs: 0%"),
]

def main():
    conn = sqlite3.connect(DB_PATH)

    # Add tariff columns to codes table
    cursor = conn.execute("PRAGMA table_info(codes)")
    existing = {row[1] for row in cursor.fetchall()}

    new_cols = [
        ("us_avg_duty", "REAL"),
        ("us_duty_range", "TEXT"),
        ("us_duty_notes", "TEXT"),
        ("us_fta_notes", "TEXT"),
    ]

    for col, typ in new_cols:
        if col not in existing:
            conn.execute(f"ALTER TABLE codes ADD COLUMN {col} {typ}")
            print(f"  ✅ Added column: {col}")

    # Update chapter-level data
    for chapter, avg_duty, duty_range, notes, fta in CHAPTER_TARIFFS:
        conn.execute(
            """UPDATE codes SET us_avg_duty = ?, us_duty_range = ?,
               us_duty_notes = ?, us_fta_notes = ?
               WHERE chapter = ? AND level = 2""",
            (avg_duty, duty_range, notes, fta, chapter)
        )
        # Also apply to all child codes in this chapter
        conn.execute(
            """UPDATE codes SET us_avg_duty = ?, us_duty_range = ?,
               us_duty_notes = ?, us_fta_notes = ?
               WHERE chapter = ? AND level > 2 AND us_avg_duty IS NULL""",
            (avg_duty, duty_range, notes, fta, chapter)
        )

    conn.commit()

    updated = conn.execute("SELECT COUNT(*) FROM codes WHERE us_avg_duty IS NOT NULL").fetchone()[0]
    print(f"\n✅ Updated {updated} codes with US tariff data")

    conn.close()

if __name__ == "__main__":
    main()
