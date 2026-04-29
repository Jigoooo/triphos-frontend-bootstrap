import { motion, useReducedMotion } from 'framer-motion';

import type { SwitchProps } from '../model/types';
import { useColors } from '@/shared/theme';

export function Switch({ checked, onChange, ariaLabel = 'Toggle switch', disabled }: SwitchProps) {
  const colors = useColors();
  const shouldReduceMotion = useReducedMotion();

  return (
    <button
      type='button'
      role='switch'
      aria-label={ariaLabel}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        userSelect: 'none',
        width: '5.4rem',
        height: '3rem',
        borderRadius: '9999px',
        border: `1px solid ${checked ? colors.interactive.primary : colors.border.default}`,
        background: checked
          ? `linear-gradient(135deg, ${colors.interactive.primarySurface}, ${colors.interactive.primary})`
          : `linear-gradient(135deg, ${colors.bg.subtle}, ${colors.bg.overlayHover})`,
        padding: '0.3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: `0 1px 10px -6px ${colors.shadow.floating}`,
        transition: 'background-color 0.3s ease, border-color 0.3s ease, opacity 0.16s ease',
        overflow: 'hidden',
      }}
    >
      <motion.div
        animate={{ x: checked ? '2.4rem' : '0rem' }}
        transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: '2.4rem',
          height: '2.4rem',
          borderRadius: '50%',
          backgroundColor: checked ? colors.bg.base : colors.bg.elevated,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${checked ? colors.border.default : colors.border.inverse}`,
          boxShadow: `0 8px 18px -12px ${colors.shadow.floating}`,
        }}
      >
        <span
          aria-hidden
          style={{
            width: '0.8rem',
            height: '0.8rem',
            borderRadius: '50%',
            backgroundColor: checked ? colors.interactive.primary : colors.text.secondary,
          }}
        />
      </motion.div>
    </button>
  );
}
