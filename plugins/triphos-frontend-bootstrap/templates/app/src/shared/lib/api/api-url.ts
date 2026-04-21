export const API_BASE_URL =
  (import.meta.env.DEV
    ? import.meta.env.VITE_DEV_API_URL || 'http://localhost:4001'
    : import.meta.env.VITE_PRODUCTION_API_URL || 'https://api.example.com') +
  (import.meta.env.VITE_API_PREFIX || '/api');

