import type { BaseDatePickerProps } from '../model/types';
import { useColors } from '@/shared/theme';

export function BaseDatePicker({ value, onChange, min, max }: BaseDatePickerProps) {
  const colors = useColors();

  return (
    <input
      type='date'
      value={value}
      min={min}
      max={max}
      onChange={(event) => onChange?.(event.target.value)}
      style={{
        width: '100%',
        height: '4rem',
        padding: '0 1.2rem',
        borderRadius: '0.8rem',
        border: `1px solid ${colors.border.default}`,
        backgroundColor: colors.bg.elevated,
        color: colors.text.primary,
        fontSize: '1.5rem',
        outline: 'none',
      }}
    />
  );
}

