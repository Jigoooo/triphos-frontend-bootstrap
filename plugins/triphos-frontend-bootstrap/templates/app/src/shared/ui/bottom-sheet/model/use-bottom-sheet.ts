import { bottomSheetActions } from './bottom-sheet-store';
import type { BottomSheetRender } from './types';

export function useBottomSheet() {
  return (render: BottomSheetRender) =>
    new Promise<boolean>((resolve) => {
      bottomSheetActions.open(render, resolve);
    });
}

