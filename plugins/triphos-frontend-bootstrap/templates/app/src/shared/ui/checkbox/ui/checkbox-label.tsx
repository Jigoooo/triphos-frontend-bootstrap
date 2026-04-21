import { useCheckboxContext } from '../model/checkbox-context';
import type { CheckboxLabelProps } from '../model/types';
import { useColors } from '@/shared/theme';

const FONT_SIZE_MAP = {
  sm: '1.4rem',
  md: '1.5rem',
  lg: '1.8rem',
} as const;

export function CheckboxLabel({ children, style }: CheckboxLabelProps) {
  const colors = useColors();
  const { size, disabled } = useCheckboxContext();

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
