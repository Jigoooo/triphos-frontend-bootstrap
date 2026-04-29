import type { CSSProperties } from 'react';

export type ProgressProps = {
  value: number;
  max?: number;
  ariaLabel?: string | undefined;
  style?: CSSProperties | undefined;
};
