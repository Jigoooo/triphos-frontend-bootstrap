import { absoluteUrl } from './seo-config';

export type ChangeFreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';

export interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: ChangeFreq;
  priority?: number;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$/u;

function clampPriority(value: number): number {
  if (Number.isNaN(value)) return 0.5;
  return Math.max(0, Math.min(1, value));
}

function renderEntry(entry: SitemapEntry): string {
  const loc = escapeXml(absoluteUrl(entry.path));
  const parts = [`    <loc>${loc}</loc>`];
  if (entry.lastmod) {
    if (!ISO_DATE_RE.test(entry.lastmod)) {
      throw new Error(
        `Invalid sitemap lastmod for ${entry.path}: ${entry.lastmod} (expected YYYY-MM-DD or full ISO 8601)`,
      );
    }
    parts.push(`    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`);
  }
  if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
  if (typeof entry.priority === 'number') {
    parts.push(`    <priority>${clampPriority(entry.priority).toFixed(2)}</priority>`);
  }
  return `  <url>\n${parts.join('\n')}\n  </url>`;
}

export function buildSitemapXml(entries: SitemapEntry[]): string {
  const body = entries.map(renderEntry).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}
