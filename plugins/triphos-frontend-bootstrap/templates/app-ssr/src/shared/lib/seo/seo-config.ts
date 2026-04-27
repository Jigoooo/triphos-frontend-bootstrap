export const SITE_NAME = 'Triphos Frontend App';
export const SITE_DESCRIPTION = 'Triphos frontend bootstrap baseline application.';
export const DEFAULT_LOCALE = 'ko_KR';
export const DEFAULT_OG_IMAGE = '/og-default.png';

function readEnv(key: string): string | undefined {
  // SSR (Nitro Node) runtime env wins over Vite build-time env so deployment
  // can override the public site URL without rebuilding the bundle.
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  const fromNode = proc?.env?.[key];
  if (typeof fromNode === 'string' && fromNode.length > 0) return fromNode;
  const viteEnv = (typeof import.meta !== 'undefined' ? import.meta.env : undefined) as
    | Record<string, string | undefined>
    | undefined;
  return viteEnv?.[key];
}

export function getBaseUrl(): string {
  const fromEnv = readEnv('VITE_SITE_URL');
  if (fromEnv && fromEnv.length > 0) return fromEnv.replace(/\/+$/, '');
  return 'http://localhost:3000';
}

export function absoluteUrl(path: string): string {
  const base = getBaseUrl();
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (!path.startsWith('/')) return `${base}/${path}`;
  return `${base}${path}`;
}
