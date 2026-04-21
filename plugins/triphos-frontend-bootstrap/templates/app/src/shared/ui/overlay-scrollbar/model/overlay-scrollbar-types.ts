import type { RefObject } from 'react';

export type OverlayScrollbarProps = {
  containerRef: RefObject<HTMLElement | null>;
  offset?: {
    top?: number;
    right?: number;
  };
};

