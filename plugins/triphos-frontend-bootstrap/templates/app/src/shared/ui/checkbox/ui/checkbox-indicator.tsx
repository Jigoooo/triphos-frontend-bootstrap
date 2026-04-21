import { motion } from 'framer-motion';

import { useCheckboxContext } from '../model/checkbox-context';
import type { CheckboxIndicatorProps } from '../model/types';
import { useColors } from '@/shared/theme';

const SIZE_MAP = {
  sm: '1.6rem',
  md: '1.8rem',
  lg: '2rem',
} as const;

export function CheckboxIndicator({ style }: CheckboxIndicatorProps) {
  const colors = useColors();
  const { checked, disabled, size, shape, isFocusVisible } = useCheckboxContext();
  const dimension = SIZE_MAP[size];

  return (
    <span
      aria-hidden
      style={{
        width: dimension,
        height: dimension,
        borderRadius: shape === 'round' ? '50%' : '0.45rem',
        border: `1px solid ${checked ? colors.interactive.primary : colors.border.default}`,
        backgroundColor: checked ? colors.interactive.primary : colors.bg.elevated,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: isFocusVisible ? `0 0 0 4px ${colors.bg.overlayHover}` : 'none',
        transform: checked ? 'scale(1)' : 'scale(0.98)',
        transition: 'background-color 0.16s ease, border-color 0.16s ease, transform 0.16s ease',
        ...style,
      }}
    >
      {checked ? (
        <motion.svg
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.14 }}
          width='65%'
          height='65%'
          viewBox='0 0 24 24'
          fill='none'
          stroke={disabled ? colors.text.disabled : colors.text.onBrand}
          strokeWidth='2.6'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <polyline points='20 6 9 17 4 12' />
        </motion.svg>
      ) : null}
    </span>
  );
}
