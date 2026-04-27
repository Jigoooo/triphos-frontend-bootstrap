import { useRadioItemContext } from '../model/radio-item-context';
import type { RadioLabelProps } from '../model/types';
import { useColors } from '@/shared/theme';

const FONT_SIZE_MAP = {
  sm: '1.4rem',
  md: '1.5rem',
  lg: '1.8rem',
} as const;

export function RadioGroupLabel({ children, style }: RadioLabelProps) {
  const colors = useColors();
  const { disabled, size } = useRadioItemContext();

  return (
    <span
      style={{
        fontSize: FONT_SIZE_MAP[size],
        lineHeight: 1.45,
        color: disabled ? colors.text.disabled : colors.text.primary,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
