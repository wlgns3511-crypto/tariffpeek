import type { MetadataRoute } from "next";
import { getAllCodes, getAllSections, getAllCountries, getCountryTariffSitemapCount, getCountryTariffSitemapPage, getAllCodeComparisonSlugs } from "@/lib/db";
import { getAllPosts } from "@/lib/blog";

const BASE_URL = "https://tariffpeek.com";
const MAX_PER_SITEMAP = 45000;

export async function generateSitemaps() {
  let totalCountryTariffs = 0;
  try {
    totalCountryTariffs = getCountryTariffSitemapCount();
  } catch {
    // Table may not exist yet during initial builds
  }
  const sitemapCount = Math.ceil(totalCountryTariffs / MAX_PER_SITEMAP) + 1;
  return Array.from({ length: sitemapCount }, (_, i) => ({ id: i }));
}

export default async function sitemap(props: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const id = Number(await props.id);

  if (id === 0) {
    // Static + sections + countries + tariff codes + comparisons + blog
    const codes = getAllCodes();
    const sections = getAllSections();
    const posts = getAllPosts();

    let countries: { slug: string }[] = [];
    try {
      countries = getAllCountries();
    } catch {
      // Table may not exist yet during initial builds
    }

    let comparePages: MetadataRoute.Sitemap = [];
    try {
      comparePages = getAllCodeComparisonSlugs(600).map((c) => ({
        url: `${BASE_URL}/compare/${c.slug}/`,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      }));
    } catch {
      // Table may not exist yet
    }

    return [
      { url: `${BASE_URL}/`, changeFrequency: "monthly", priority: 1.0 },
      { url: `${BASE_URL}/search/`, changeFrequency: "monthly", priority: 0.9 },
      { url: `${BASE_URL}/about/`, changeFrequency: "monthly", priority: 0.5 },
      { url: `${BASE_URL}/privacy/`, changeFrequency: "monthly", priority: 0.3 },
      { url: `${BASE_URL}/terms/`, changeFrequency: "monthly", priority: 0.3 },
      { url: `${BASE_URL}/contact/`, changeFrequency: "monthly", priority: 0.3 },
      { url: `${BASE_URL}/blog/`, changeFrequency: "weekly" as const, priority: 0.8 },
      ...posts.map((p) => ({
        url: `${BASE_URL}/blog/${p.slug}/`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
        lastModified: p.updatedAt ?? p.publishedAt,
      })),
      ...sections.map((s) => ({
        url: `${BASE_URL}/section/${s.id}/`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...codes.map((c) => ({
        url: `${BASE_URL}/code/${c.slug}/`,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...countries.map((c) => ({
        url: `${BASE_URL}/import/${c.slug}/`,
        changeFrequency: "monthly" as const,
        priority: 0.8,
      })),
      ...comparePages,
    ];
  }

  // Sitemap 1+: country-specific tariff pages
  const offset = (id - 1) * MAX_PER_SITEMAP;
  let entries: { country_slug: string; code_slug: string }[] = [];
  try {
    entries = getCountryTariffSitemapPage(offset, MAX_PER_SITEMAP);
  } catch {
    // Table may not exist yet during initial builds
  }

  return entries.map((e) => ({
    url: `${BASE_URL}/import/${e.country_slug}/${e.code_slug}/`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
}
