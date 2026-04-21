import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

import type { SpeedDialProps } from '../model/types';
import { Z_INDEX } from '@/shared/constants';
import { useColors } from '@/shared/theme';
import { RawButton } from '@/shared/ui/button';

const DEFAULT_RIGHT = '2rem';
const DEFAULT_BOTTOM = '8.4rem';

export function SpeedDial({
  actions,
  icon,
  onActionSelect,
  openIcon,
  ariaLabel = '메뉴',
  right = DEFAULT_RIGHT,
  bottom = DEFAULT_BOTTOM,
}: SpeedDialProps) {
  const colors = useColors();
  const shouldReduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);

  const springTransition = shouldReduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 400, damping: 25 };

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup='menu'
        aria-label={open ? '메뉴 닫기' : ariaLabel}
        style={{
          position: 'fixed',
          right,
          bottom,
          width: '4.8rem',
          height: '4.8rem',
          borderRadius: '50%',
          background: colors.interactive.primary,
          border: 'none',
          color: colors.text.onBrand,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: Z_INDEX.FAB,
          boxShadow: `0 4px 12px ${colors.shadow.floating}`,
        }}
      >
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={springTransition}>
          {open ? openIcon ?? <X size={20} color={colors.text.onBrand} /> : icon}
        </motion.div>
      </button>

      {createPortal(
        <AnimatePresence>
          {open ? (
            <>
              <motion.div
                key='speed-dial-backdrop'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                onClick={() => setOpen(false)}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.24)',
                  zIndex: Z_INDEX.FAB_BACKDROP,
                }}
              />

              {actions.map((action, index) => (
                <motion.div
                  key={action.id}
                  role='menuitem'
                  initial={{ opacity: 0, y: 20, scale: 0.3 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.5 }}
                  transition={{
                    ...springTransition,
                    delay: shouldReduceMotion ? 0 : index * 0.05,
                  }}
                  style={{
                    position: 'fixed',
                    right,
                    bottom: `calc(${bottom} + ${(index + 1) * 5.4}rem)`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    zIndex: Z_INDEX.FAB,
                    flexDirection: 'row-reverse',
                  }}
                >
                  <RawButton
                    onClick={() => {
                      setOpen(false);
                      onActionSelect(action.id);
                    }}
                    style={{
                      width: '4rem',
                      height: '4rem',
                      borderRadius: '50%',
                      background: colors.bg.elevated,
                      border: `1px solid ${colors.border.default}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: colors.interactive.primary,
                    }}
                  >
                    {action.icon}
                  </RawButton>
                  <div
                    style={{
                      padding: '0.8rem 1rem',
                      borderRadius: '999px',
                      backgroundColor: colors.bg.elevated,
                      color: colors.text.primary,
                      border: `1px solid ${colors.border.default}`,
                      boxShadow: `0 4px 12px ${colors.shadow.floating}`,
                      fontSize: '1.3rem',
                      fontWeight: 600,
                    }}
                  >
                    {action.label}
                  </div>
                </motion.div>
              ))}
            </>
          ) : null}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

