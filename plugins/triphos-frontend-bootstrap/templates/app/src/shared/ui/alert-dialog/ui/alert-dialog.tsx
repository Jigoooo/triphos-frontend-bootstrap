import { AnimatePresence, motion } from 'framer-motion';
import { type ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { alertDialogActions, useAlertDialogStore } from '../model/alert-dialog-store';
import { AlertDialogMode, AlertDialogType } from '../model/types';
import { Z_INDEX } from '@/shared/constants';
import { useColors } from '@/shared/theme';
import { RawButton } from '@/shared/ui/button';
import { OverlayType, overlayStackActions, pushOverlayHistoryState } from '@/shared/ui/overlay-stack';

const DESTRUCTIVE_TYPES = new Set([AlertDialogType.Warning, AlertDialogType.Error]);

export function AlertDialogRenderer(): ReactNode {
  const colors = useColors();
  const isOpen = useAlertDialogStore((state) => state.isOpen);
  const mode = useAlertDialogStore((state) => state.mode);
  const config = useAlertDialogStore((state) => state.config);
  const historyIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const id = `alert-${crypto.randomUUID()}`;
      historyIdRef.current = id;
      pushOverlayHistoryState(id);
      overlayStackActions.push(id, OverlayType.Alert, (value) => alertDialogActions.close(value));
    } else {
      const id = historyIdRef.current;
      historyIdRef.current = null;
      if (id && overlayStackActions.has(id)) {
        overlayStackActions.closeWithBack(id);
      }
    }
  }, [isOpen]);

  const handleClose = (value: boolean) => {
    const id = historyIdRef.current;
    historyIdRef.current = null;
    alertDialogActions.close(value);
    if (id) {
      overlayStackActions.closeWithBack(id);
    }
  };

  useEffect(() => {
    if (!isOpen || !config) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handleClose(true);
      } else if (event.key === 'Escape' && config.closeOnBackdropClick !== false) {
        event.preventDefault();
        handleClose(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config, isOpen]);

  const accentColor = config ? colors.feedback[config.type as keyof typeof colors.feedback] : colors.interactive.primary;
  const isDestructive = config ? DESTRUCTIVE_TYPES.has(config.type) : false;

  return createPortal(
    <AnimatePresence>
      {isOpen && config ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: 'auto' }}
            exit={{ opacity: 0, pointerEvents: 'none' }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: Z_INDEX.ALERT_BACKDROP,
              backgroundColor: colors.overlay.modalBackdrop,
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => {
              if (config.closeOnBackdropClick !== false) handleClose(false);
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 1.08, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%', pointerEvents: 'auto' }}
            exit={{ opacity: 0, scale: 0.96, x: '-50%', y: '-50%', pointerEvents: 'none' }}
            transition={{ type: 'spring', damping: 20, stiffness: 380, mass: 0.8 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              zIndex: Z_INDEX.ALERT,
              width: '27rem',
              maxWidth: 'calc(100vw - 4rem)',
              backgroundColor: `color-mix(in srgb, ${colors.bg.elevated} 92%, ${accentColor} 8%)`,
              border: `1px solid ${colors.border.default}`,
              borderRadius: '1.4rem',
              overflow: 'hidden',
              boxShadow: `0 24px 64px ${colors.shadow.modal}`,
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              style={{
                padding: '2rem 2rem 0.8rem',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
              }}
            >
              {config.title ? (
                <h2 style={{ fontSize: '1.7rem', fontWeight: 600, color: colors.text.primary, lineHeight: 1.25 }}>
                  {config.title}
                </h2>
              ) : null}
              {config.message ? (
                <p style={{ fontSize: '1.3rem', color: colors.text.secondary, lineHeight: 1.45 }}>
                  {config.message}
                </p>
              ) : null}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: mode === AlertDialogMode.Confirm ? 'row-reverse' : 'column',
                gap: '0.8rem',
                padding: '1.2rem 1.6rem 1.6rem',
              }}
            >
              <RawButton
                onClick={() => handleClose(true)}
                style={{
                  flex: mode === AlertDialogMode.Confirm ? 1 : undefined,
                  height: '4rem',
                  border: 'none',
                  borderRadius: '1rem',
                  background: isDestructive ? accentColor : colors.interactive.primary,
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: colors.text.onBrand,
                  cursor: 'pointer',
                }}
              >
                {config.confirmText ?? '확인'}
              </RawButton>
              {mode === AlertDialogMode.Confirm ? (
                <RawButton
                  onClick={() => handleClose(false)}
                  style={{
                    flex: 1,
                    height: '4rem',
                    border: `1px solid ${colors.border.default}`,
                    borderRadius: '1rem',
                    background: colors.bg.elevated,
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: colors.text.primary,
                    cursor: 'pointer',
                  }}
                >
                  {config.cancelText ?? '취소'}
                </RawButton>
              ) : null}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
