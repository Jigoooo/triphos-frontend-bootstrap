import { absoluteUrl, getBaseUrl, SITE_DESCRIPTION, SITE_NAME } from './seo-config';

interface OrganizationInput {
  name?: string;
  url?: string;
  logo?: string;
}

interface WebPageInput {
  name: string;
  description: string;
  path: string;
}

interface ArticleInput {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified?: string;
  authorName: string;
  image?: string;
}

interface BreadcrumbInput {
  name: string;
  path: string;
}

export function jsonLdOrganization(input: OrganizationInput = {}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: input.name ?? SITE_NAME,
    url: input.url ?? getBaseUrl(),
    ...(input.logo ? { logo: absoluteUrl(input.logo) } : {}),
  };
}

export function jsonLdWebSite(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: getBaseUrl(),
    description: SITE_DESCRIPTION,
  };
}

export function jsonLdWebPage(input: WebPageInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: getBaseUrl() },
  };
}

export function jsonLdArticle(input: ArticleInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    url: absoluteUrl(input.path),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: { '@type': 'Person', name: input.authorName },
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
  };
}

export function jsonLdBreadcrumbs(items: BreadcrumbInput[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function jsonLdScript(payload: Record<string, unknown>): { type: 'application/ld+json'; children: string } {
  return {
    type: 'application/ld+json',
    children: JSON.stringify(payload),
  };
}
