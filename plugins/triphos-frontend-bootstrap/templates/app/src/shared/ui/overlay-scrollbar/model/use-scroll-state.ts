import { type RefObject, useRef, useSyncExternalStore } from 'react';

import type { ScrollSnapshot } from './overlay-scrollbar-types';

const defaultSnapshot: ScrollSnapshot = Object.freeze({
  scrollTop: 0,
  scrollHeight: 0,
  clientHeight: 0,
  scrollLeft: 0,
  scrollWidth: 0,
  clientWidth: 0,
});

function snapshotEquals(a: ScrollSnapshot, b: ScrollSnapshot) {
  return (
    a.scrollTop === b.scrollTop &&
    a.scrollHeight === b.scrollHeight &&
    a.clientHeight === b.clientHeight &&
    a.scrollLeft === b.scrollLeft &&
    a.scrollWidth === b.scrollWidth &&
    a.clientWidth === b.clientWidth
  );
}

export function useScrollState(containerRef: RefObject<HTMLDivElement | null>): ScrollSnapshot {
  const snapshotRef = useRef<ScrollSnapshot>(defaultSnapshot);

  return useSyncExternalStore(
    (onStoreChange) => {
      const element = containerRef.current;
      if (!element) return () => {};

      let raf = 0;
      const observedChildren = new Set<Element>();

      const notify = () => {
        const next: ScrollSnapshot = {
          scrollTop: element.scrollTop,
          scrollHeight: element.scrollHeight,
          clientHeight: element.clientHeight,
          scrollLeft: element.scrollLeft,
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
        };

        if (!snapshotEquals(snapshotRef.current, next)) {
          snapshotRef.current = next;
          if (!raf) {
            raf = requestAnimationFrame(() => {
              raf = 0;
              onStoreChange();
            });
          }
        }
      };

      const observeChildren = (resizeObserver: ResizeObserver) => {
        for (const child of Array.from(element.children)) {
          if (observedChildren.has(child)) {
            continue;
          }

          observedChildren.add(child);
          resizeObserver.observe(child);
        }
      };

      element.addEventListener('scroll', notify, { passive: true });
      const resizeObserver = new ResizeObserver(notify);
      resizeObserver.observe(element);
      observeChildren(resizeObserver);

      const mutationObserver =
        typeof MutationObserver === 'undefined'
          ? null
          : new MutationObserver(() => {
              observeChildren(resizeObserver);
              notify();
            });
      mutationObserver?.observe(element, { childList: true });

      notify();

      return () => {
        if (raf) cancelAnimationFrame(raf);
        element.removeEventListener('scroll', notify);
        mutationObserver?.disconnect();
        resizeObserver.disconnect();
      };
    },
    () => snapshotRef.current,
  );
}
