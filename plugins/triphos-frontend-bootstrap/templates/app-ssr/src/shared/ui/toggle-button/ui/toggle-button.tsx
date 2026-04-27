import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

import { useColors } from '@/shared/theme';

export function ToggleButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  const colors = useColors();
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.button
      type='button'
      onClick={onClick}
      {...(!shouldReduceMotion ? { whileTap: { scale: 0.98 } } : {})}
      style={{
        border: `1px solid ${selected ? colors.interactive.primary : colors.border.default}`,
        borderRadius: '999px',
        backgroundColor: selected ? colors.interactive.primarySurface : colors.bg.elevated,
        color: selected ? colors.interactive.primary : colors.text.primary,
        font: 'inherit',
        fontSize: '1.4rem',
        fontWeight: 600,
        padding: '0.8rem 1.2rem',
        cursor: 'pointer',
        boxShadow: selected ? `0 0 0 0.3rem ${colors.bg.overlayHover}` : `0 12px 26px -24px ${colors.shadow.floating}`,
        transition: 'border-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease',
      }}
    >
      {children}
    </motion.button>
  );
}
