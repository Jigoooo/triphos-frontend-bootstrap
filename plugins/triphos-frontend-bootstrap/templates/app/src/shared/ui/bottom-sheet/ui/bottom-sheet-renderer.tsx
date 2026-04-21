import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { bottomSheetActions, useBottomSheetStore } from '../model/bottom-sheet-store';
import { Z_INDEX } from '@/shared/constants';
import { useColors } from '@/shared/theme';
import { OverlayType, overlayStackActions, pushOverlayHistoryState } from '@/shared/ui/overlay-stack';

export function BottomSheetRenderer(): ReactNode {
  const colors = useColors();
  const isOpen = useBottomSheetStore((state) => state.isOpen);
  const render = useBottomSheetStore((state) => state.render);
  const historyIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const id = `bottom-sheet-${crypto.randomUUID()}`;
      historyIdRef.current = id;
      pushOverlayHistoryState(id);
      overlayStackActions.push(id, OverlayType.Bottomsheet, (value) => bottomSheetActions.close(value));
    } else {
      const id = historyIdRef.current;
      historyIdRef.current = null;
      if (id && overlayStackActions.has(id)) {
        overlayStackActions.closeWithBack(id);
      }
    }
  }, [isOpen]);

  const handleClose = (value = false) => {
    const id = historyIdRef.current;
    historyIdRef.current = null;
    bottomSheetActions.close(value);
    if (id) {
      overlayStackActions.closeWithBack(id);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && render ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => handleClose(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: Z_INDEX.MODAL_BACKDROP,
              backgroundColor: colors.overlay.sheetBackdrop,
              backdropFilter: 'blur(2px)',
            }}
          />
          <motion.div
            role='dialog'
            aria-modal='true'
            initial={{ y: '100%', opacity: 0.88, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: '100%', opacity: 0.92, scale: 0.992 }}
            transition={{ type: 'spring', stiffness: 340, damping: 34, mass: 0.92 }}
            style={{
              position: 'fixed',
              insetInline: 0,
              bottom: 0,
              zIndex: Z_INDEX.MODAL,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              onClick={(event) => event.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '55rem',
                maxHeight: 'min(92dvh, 72rem)',
                overflowY: 'auto',
                borderRadius: '2.8rem 2.8rem 0 0',
                border: `1px solid ${colors.border.default}`,
                background: `linear-gradient(180deg, ${colors.bg.elevated}, ${colors.bg.subtle})`,
                boxShadow: `0 -24px 56px ${colors.shadow.modal}`,
                pointerEvents: 'auto',
                scrollbarWidth: 'none',
              }}
            >
              <div
                aria-hidden
                style={{
                  width: '4.8rem',
                  height: '0.5rem',
                  borderRadius: '999px',
                  backgroundColor: colors.border.default,
                  margin: '1rem auto 0.6rem',
                }}
              />
              {render()}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

