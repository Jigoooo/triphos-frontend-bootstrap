import { motion } from 'framer-motion';
import { useId } from 'react';

import type { CheckboxProps } from '../model/types';
import { useColors } from '@/shared/theme';

const SIZE_DIMENSIONS: Record<string, string> = {
  sm: '1.6rem',
  md: '1.8rem',
  lg: '2rem',
};

const SIZE_FONTS: Record<string, string> = {
  sm: '1.4rem',
  md: '1.5rem',
  lg: '1.8rem',
};

export function Checkbox({
  size = 'md',
  shape = 'square',
  checked = false,
  onChange,
  disabled,
  label,
  id: providedId,
  ...props
}: CheckboxProps) {
  const colors = useColors();
  const dimension = SIZE_DIMENSIONS[size] || SIZE_DIMENSIONS.md;
  const autoId = useId();
  const id = providedId || autoId;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.8rem',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <input
        id={id}
        type='checkbox'
        checked={checked}
        onChange={(event) => onChange?.(event.target.checked)}
        disabled={disabled}
        aria-checked={checked}
        {...props}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
      />
      <motion.label
        htmlFor={id}
        {...(!disabled ? { whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } } : {})}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: dimension,
          height: dimension,
          borderRadius: shape === 'round' ? '50%' : '0.4rem',
          border: `1px solid ${checked ? colors.interactive.primary : colors.border.default}`,
          backgroundColor: checked ? colors.interactive.primary : 'transparent',
          transition: 'all 0.1s ease-in-out',
          cursor: disabled ? 'default' : 'pointer',
          flexShrink: 0,
        }}
      >
        {checked ? (
          <motion.svg
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.1 }}
            width='65%'
            height='65%'
            viewBox='0 0 24 24'
            fill='none'
            stroke={colors.text.onBrand}
            strokeWidth='2.5'
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <polyline points='20 6 9 17 4 12' />
          </motion.svg>
        ) : null}
      </motion.label>
      {label ? (
        <label
          htmlFor={id}
          style={{
            cursor: disabled ? 'default' : 'pointer',
            userSelect: 'none',
            fontSize: SIZE_FONTS[size] || SIZE_FONTS.md,
            color: colors.text.primary,
          }}
        >
          {label}
        </label>
      ) : null}
    </motion.div>
  );
}
