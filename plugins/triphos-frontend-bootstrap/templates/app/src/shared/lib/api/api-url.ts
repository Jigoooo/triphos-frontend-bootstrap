export const API_BASE_URL =
  (import.meta.env.VITE_API_ORIGIN || 'http://localhost:3001') +
  (import.meta.env.VITE_API_PREFIX || '/api');
