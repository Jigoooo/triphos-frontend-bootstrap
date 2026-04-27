export const SITE_NAME = 'Triphos Frontend App';
export const SITE_DESCRIPTION = 'Triphos frontend bootstrap baseline application.';
export const DEFAULT_LOCALE = 'ko_KR';
export const DEFAULT_OG_IMAGE = '/og-default.png';

export function getBaseUrl(): string {
  const env = import.meta.env as unknown as Record<string, string | undefined>;
  const fromEnv = env['VITE_SITE_URL'];
  if (fromEnv && fromEnv.length > 0) return fromEnv.replace(/\/+$/, '');
  return 'http://localhost:3000';
}

export function absoluteUrl(path: string): string {
  const base = getBaseUrl();
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (!path.startsWith('/')) return `${base}/${path}`;
  return `${base}${path}`;
}
