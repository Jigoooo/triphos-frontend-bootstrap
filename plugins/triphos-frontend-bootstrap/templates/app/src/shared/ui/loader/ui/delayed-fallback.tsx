import { useEffect, useState, type ReactNode } from 'react';

export function DelayedFallback({
  delay = 300,
  fallback,
}: {
  delay?: number;
  fallback: ReactNode;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timeout);
  }, [delay]);

  return visible ? <>{fallback}</> : null;
}

