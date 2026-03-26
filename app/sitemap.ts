import type { MetadataRoute } from "next";
import { getAllCodes, getAllSections } from "@/lib/db";

const BASE_URL = "https://tariffpeek.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const codes = getAllCodes();
  const sections = getAllSections();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "monthly", priority: 1.0 },
    { url: `${BASE_URL}/search`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/contact`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const sectionPages: MetadataRoute.Sitemap = sections.map((s) => ({
    url: `${BASE_URL}/section/${s.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const codePages: MetadataRoute.Sitemap = codes.map((c) => ({
    url: `${BASE_URL}/code/${c.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...sectionPages, ...codePages];
}
