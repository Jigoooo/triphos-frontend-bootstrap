import { motion } from 'framer-motion';

import type { SwitchProps } from '../model/types';
import { useColors } from '@/shared/theme';

export function Switch({ checked, onChange, disabled }: SwitchProps) {
  const colors = useColors();

  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        userSelect: 'none',
        width: '5.6rem',
        height: '2.8rem',
        borderRadius: '9999px',
        border: `1px solid ${checked ? colors.interactive.primary : colors.border.default}`,
        background: checked
          ? `linear-gradient(135deg, ${colors.interactive.primarySurface}, ${colors.interactive.primary})`
          : `linear-gradient(135deg, ${colors.bg.subtle}, ${colors.bg.overlayHover})`,
        padding: '0.3rem',
        display: 'flex',
        alignItems: 'center',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: `0 1px 10px -6px ${colors.shadow.floating}`,
        transition: 'background-color 0.3s ease, border-color 0.3s ease, opacity 0.16s ease',
      }}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: '2.2rem',
          height: '2.2rem',
          borderRadius: '50%',
          backgroundColor: checked ? colors.bg.base : colors.bg.elevated,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: checked ? '3.1rem' : '0.3rem',
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
