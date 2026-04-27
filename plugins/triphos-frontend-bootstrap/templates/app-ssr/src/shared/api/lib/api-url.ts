const DEFAULT_API_URL = 'http://localhost';
const DEFAULT_API_PORT = '3001';
const DEFAULT_API_SUFFIX = 'api';

function normalizeApiSuffix(value: string) {
  return value.replace(/^\/+|\/+$/g, '');
}

export function getApiBasePath() {
  const suffix = normalizeApiSuffix(import.meta.env.VITE_SUFFIX_API_ENDPOINT || DEFAULT_API_SUFFIX);
  return `/${suffix}`;
}

export function getProductionApiOrigin() {
  const apiUrl = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
  const apiPort = import.meta.env.VITE_API_PORT || DEFAULT_API_PORT;
  return `${apiUrl}:${apiPort}`;
}

export function getProductionApiBaseUrl() {
  return `${getProductionApiOrigin()}${getApiBasePath()}`;
}
