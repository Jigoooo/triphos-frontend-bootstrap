import { absoluteUrl, DEFAULT_LOCALE, DEFAULT_OG_IMAGE, SITE_NAME } from './seo-config';

const TITLE_BUDGET = 60;
const DESCRIPTION_BUDGET = 160;

export interface BuildMetaInput {
  title: string;
  description: string;
  path: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
}

export interface MetaTag {
  name?: string;
  property?: string;
  content?: string;
  charSet?: string;
  title?: string;
}

export interface LinkTag {
  rel: string;
  href: string;
  type?: string;
  sizes?: string;
}

export interface BuiltHead {
  meta: MetaTag[];
  links: LinkTag[];
}

function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function buildMeta(input: BuildMetaInput): BuiltHead {
  const title = clamp(input.title, TITLE_BUDGET);
  const description = clamp(input.description, DESCRIPTION_BUDGET);

  // noIndex pages must not leak OG/Twitter/canonical metadata: social caches
  // would still serve the page and search engines could pick up canonical hints
  // even though we asked them not to index. Emit only the bare minimum.
  if (input.noIndex) {
    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { name: 'robots', content: 'noindex, nofollow' },
      ],
      links: [],
    };
  }

  const ogType = input.ogType ?? 'website';
  const ogImage = absoluteUrl(input.ogImage ?? DEFAULT_OG_IMAGE);
  const ogUrl = absoluteUrl(input.path);
  const twitterCard = input.twitterCard ?? 'summary_large_image';

  const meta: MetaTag[] = [
    { title },
    { name: 'description', content: description },
    { property: 'og:type', content: ogType },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:image', content: ogImage },
    { property: 'og:url', content: ogUrl },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:locale', content: DEFAULT_LOCALE },
    { name: 'twitter:card', content: twitterCard },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: ogImage },
  ];

  const links: LinkTag[] = [{ rel: 'canonical', href: ogUrl }];

  return { meta, links };
}
