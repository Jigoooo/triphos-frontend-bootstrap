const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export function shouldUseDevMocks() {
  return import.meta.env.DEV && import.meta.env.VITE_USE_DEV_MOCKS === 'true';
}

export function canUseDevMockWorker() {
  if (!shouldUseDevMocks()) return false;
  if (typeof window === 'undefined') return false;

  const { hostname } = window.location;
  return window.isSecureContext && (LOCAL_HOSTS.has(hostname) || hostname.endsWith('.localhost'));
}

