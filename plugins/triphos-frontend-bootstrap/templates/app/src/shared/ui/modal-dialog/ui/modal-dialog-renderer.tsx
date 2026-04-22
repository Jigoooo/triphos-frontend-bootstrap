import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { modalDialogActions, useModalDialogStore } from '../model/modal-dialog-store';
import { Z_INDEX } from '@/shared/constants';
import { useColors } from '@/shared/theme';
import { OverlayType, overlayStackActions, pushOverlayHistoryState } from '@/shared/ui/overlay-stack';

export function ModalDialogRenderer(): ReactNode {
  const colors = useColors();
  const isOpen = useModalDialogStore((state) => state.isOpen);
  const renderContent = useModalDialogStore((state) => state.renderContent);
  const closeOnBackdropClick = useModalDialogStore((state) => state.closeOnBackdropClick);
  const historyIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const id = `modal-${crypto.randomUUID()}`;
      historyIdRef.current = id;
      pushOverlayHistoryState(id);
      overlayStackActions.push(id, OverlayType.Dialog, (value) => modalDialogActions.close(value));
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
    modalDialogActions.close(value);
    if (id) {
      overlayStackActions.closeWithBack(id);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnBackdropClick) {
        event.preventDefault();
        handleClose(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeOnBackdropClick, isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && renderContent ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: Z_INDEX.MODAL_BACKDROP,
              backgroundColor: colors.overlay.modalBackdrop,
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => {
              if (closeOnBackdropClick) handleClose(false);
            }}
          />
          <motion.div
            initial={{ opacity: 0, x: '-50%', y: 'calc(-50% + 24px)', scale: 0.96 }}
            animate={{ opacity: 1, x: '-50%', y: '-50%', scale: 1 }}
            exit={{ opacity: 0, x: '-50%', y: 'calc(-50% + 12px)', scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              zIndex: Z_INDEX.MODAL,
              width: '44rem',
              maxWidth: 'calc(100vw - 3.2rem)',
              maxHeight: 'calc(100vh - 3.2rem)',
              overflowY: 'auto',
              backgroundColor: colors.bg.elevated,
              border: `1px solid ${colors.border.default}`,
              borderRadius: '1.6rem',
              boxShadow: `0 24px 64px ${colors.shadow.modal}`,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {renderContent()}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
