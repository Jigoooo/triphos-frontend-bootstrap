import type { CSSProperties } from 'react';

export type ProgressProps = {
  value: number;
  max?: number;
  style?: CSSProperties | undefined;
};
