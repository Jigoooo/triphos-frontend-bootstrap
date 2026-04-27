import type { ReactNode } from 'react';

export type BottomSheetRender = () => ReactNode;

export type BottomSheetState = {
  isOpen: boolean;
  render: BottomSheetRender | null;
  resolve: ((value: boolean) => void) | null;
};

