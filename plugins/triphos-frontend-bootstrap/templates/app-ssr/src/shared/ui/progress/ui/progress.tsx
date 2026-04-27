import { motion, useReducedMotion } from 'framer-motion';

import type { ProgressProps } from '../model/types';
import { useColors } from '@/shared/theme';

export function Progress({ value, max = 100, style }: ProgressProps) {
  const colors = useColors();
  const shouldReduceMotion = useReducedMotion();
  const safeMax = max > 0 ? max : 100;
  const clampedValue = Math.min(Math.max(value, 0), safeMax);
  const percentage = (clampedValue / safeMax) * 100;

  return (
    <div
      role='progressbar'
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={Math.round(clampedValue)}
      style={{
        width: '100%',
        height: '1rem',
        borderRadius: '999px',
        overflow: 'hidden',
        border: `1px solid ${colors.border.default}`,
        backgroundColor: colors.bg.subtle,
        boxShadow: `inset 0 1px 4px ${colors.shadow.floating}`,
        ...style,
      }}
    >
      <motion.div
        initial={false}
        animate={{ width: `${percentage}%` }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.28, ease: 'easeOut' }}
        style={{
          height: '100%',
          borderRadius: '999px',
          background: `linear-gradient(90deg, ${colors.interactive.primary}, ${colors.interactive.primaryHover})`,
        }}
      />
    </div>
  );
}
