import { useDeferredValue, useEffect, useState } from 'react';

export function useDebounceDeferredValue<T>(value: T, delay = 250) {
  const deferred = useDeferredValue(value);
  const [debounced, setDebounced] = useState(deferred);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebounced(deferred);
    }, delay);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [deferred, delay]);

  return debounced;
}

