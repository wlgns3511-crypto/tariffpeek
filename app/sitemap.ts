import type { MetadataRoute } from "next";
import { getAllCodes, getAllSections, getAllCountries, getCountryTariffSitemapEntries, getAllCodeComparisonSlugs } from "@/lib/db";
import { getAllPosts } from "@/lib/blog";

const BASE_URL = "https://tariffpeek.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const codes = getAllCodes();
  const sections = getAllSections();
  const posts = getAllPosts();

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

  // Country overview pages (20 countries)
  let countries: { slug: string }[] = [];
  try {
    countries = getAllCountries();
  } catch {
    // Table may not exist yet during initial builds
  }

  const countryOverviewPages: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${BASE_URL}/import/${c.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Country-specific tariff pages (limit to keep sitemap under 50,000)
  // Reserve space for static + section + code pages
  const existingCount = staticPages.length + sectionPages.length + codePages.length + countryOverviewPages.length;
  const countryTariffLimit = Math.min(45000 - existingCount, 38000);

  let countryTariffPages: MetadataRoute.Sitemap = [];
  try {
    const entries = getCountryTariffSitemapEntries(countryTariffLimit);
    countryTariffPages = entries.map((e) => ({
      url: `${BASE_URL}/import/${e.country_slug}/${e.code_slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // Table may not exist yet during initial builds
  }

  // Code comparison pages
  let comparePages: MetadataRoute.Sitemap = [];
  try {
    comparePages = getAllCodeComparisonSlugs(600).map((c) => ({
      url: `${BASE_URL}/compare/${c.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch {
    // Table may not exist yet
  }

  return [
    ...staticPages,
    { url: `${BASE_URL}/blog/`, changeFrequency: "weekly" as const, priority: 0.8 },
    ...posts.map((p) => ({
      url: `${BASE_URL}/blog/${p.slug}/`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      lastModified: p.updatedAt ?? p.publishedAt,
    })),
    ...sectionPages,
    ...codePages,
    ...countryOverviewPages,
    ...countryTariffPages,
    ...comparePages,
  ];
}
