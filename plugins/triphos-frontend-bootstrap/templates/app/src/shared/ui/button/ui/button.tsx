import { useReducedMotion } from 'framer-motion';

import { BaseButton } from './base-button';
import type { ButtonProps } from '../model/types';
import { useColors } from '@/shared/theme';

const SIZE_HEIGHT: Record<string, string> = {
  xs: '2.8rem',
  sm: '3.6rem',
  md: '4.4rem',
  lg: '4.8rem',
};

const SIZE_FONT: Record<string, string> = {
  xs: '1.1rem',
  sm: '1.4rem',
  md: '1.6rem',
  lg: '1.8rem',
};

export function Button({
  children,
  isLoading = false,
  loadingContent,
  onClick,
  type = 'button',
  size = 'md',
  variant = 'solid',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const colors = useColors();
  const shouldReduceMotion = useReducedMotion();
  const isDisabled = disabled || isLoading;

  const getVariantStyle = () => {
    if (variant === 'outline') {
      return {
        backgroundColor: 'transparent',
        color: colors.interactive.primary,
        border: `1px solid ${colors.interactive.primary}`,
      };
    }

    if (variant === 'ghost') {
      return {
        backgroundColor: 'transparent',
        color: colors.text.primary,
        border: 'none',
      };
    }

    return {
      backgroundColor: colors.interactive.primary,
      color: colors.text.onBrand,
      border: 'none',
    };
  };

  return (
    <BaseButton
      type={type}
      disabled={disabled}
      isLoading={isLoading}
      loadingContent={loadingContent}
      onClick={onClick}
      {...(!isDisabled && !shouldReduceMotion ? { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } } : {})}
      transition={{ duration: 0.1 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.6rem',
        minHeight: SIZE_HEIGHT[size] || SIZE_HEIGHT.md,
        padding: '0 1.6rem',
        borderRadius: '0.9rem',
        fontSize: SIZE_FONT[size] || SIZE_FONT.md,
        fontWeight: 600,
        cursor: isDisabled ? 'default' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        ...getVariantStyle(),
        ...style,
      }}
      {...props}
    >
      {children}
    </BaseButton>
  );
}
