import { PUBLISHER, EDITORIAL_TEAM } from './authorship';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tariffpeek.com';

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${BASE_URL}${item.url}`,
    })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

/**
 * Google's Dataset rich result requires description length 50 ≤ n ≤ 5000.
 * HS chapter descriptions in our DB are sometimes as short as 13 chars
 * ("Animals; live"), causing GSC "description length invalid" warnings on
 * the Dataset schema. We pad short strings with a domain-relevant boilerplate
 * and truncate anything over 4,900 chars to stay safely under the cap.
 */
const DATASET_DESC_MIN = 50;
const DATASET_DESC_MAX = 4900;
const DATASET_PAD_SUFFIX =
  ' — WCO Harmonized System tariff classification with US MFN duty rates, FTA preferences, and import benchmarks sourced from USITC and USTR.';

export function normalizeDatasetDescription(description: string): string {
  const trimmed = (description ?? '').trim();
  let out = trimmed;
  if (out.length < DATASET_DESC_MIN) {
    out = `${out}${DATASET_PAD_SUFFIX}`.slice(0, DATASET_DESC_MAX);
  }
  if (out.length > DATASET_DESC_MAX) {
    out = `${out.slice(0, DATASET_DESC_MAX - 1).trimEnd()}…`;
  }
  return out;
}

export function datasetSchema(name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name,
    description: normalizeDatasetDescription(description),
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: { '@type': 'Organization', name: 'World Customs Organization' },
    distribution: { '@type': 'DataDownload', encodingFormat: 'text/html', contentUrl: BASE_URL },
  };
}

export function articleSchema(post: { title: string; description: string; slug: string; urlPath?: string; publishedAt: string; updatedAt?: string; category?: string }) {
  // slug is treated as a full path fragment (e.g. "guide/my-guide")
  const articlePath = post.urlPath ?? (post.slug.includes('/') ? `/${post.slug.replace(/^\/+|\/+$/g, '')}/` : `/blog/${post.slug}/`);
  const url = `${BASE_URL}${articlePath}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    author: { '@type': 'Organization', name: 'TariffPeek', url: BASE_URL },
    publisher: { '@type': 'Organization', name: 'TariffPeek', url: BASE_URL },
    mainEntityOfPage: url,
    ...(post.category && { articleSection: post.category }),
  };
}
