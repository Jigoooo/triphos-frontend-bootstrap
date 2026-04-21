import { motion } from 'framer-motion';

import { useRadioItemContext } from '../model/radio-item-context';
import type { RadioIndicatorProps } from '../model/types';
import { useColors } from '@/shared/theme';

const SIZE_MAP = {
  sm: '1.6rem',
  md: '1.8rem',
  lg: '2rem',
} as const;

export function RadioGroupIndicator({ style }: RadioIndicatorProps) {
  const colors = useColors();
  const { checked, disabled, size, isFocusVisible } = useRadioItemContext();
  const dimension = SIZE_MAP[size];

  return (
    <span
      aria-hidden
      style={{
        width: dimension,
        height: dimension,
        borderRadius: '50%',
        border: `2px solid ${checked ? colors.interactive.primary : colors.border.default}`,
        backgroundColor: colors.bg.elevated,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isFocusVisible ? `0 0 0 4px ${colors.bg.overlayHover}` : 'none',
        transform: checked ? 'scale(1)' : 'scale(0.98)',
        transition: 'border-color 0.16s ease, transform 0.16s ease',
        ...style,
      }}
    >
      {checked ? (
        <motion.span
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.14 }}
          style={{
            width: '50%',
            height: '50%',
            borderRadius: '50%',
            backgroundColor: disabled ? colors.text.disabled : colors.interactive.primary,
          }}
        />
      ) : null}
    </span>
  );
}
