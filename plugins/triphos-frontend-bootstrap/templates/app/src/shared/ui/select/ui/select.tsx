import type { SelectProps } from '../model/types';
import { useColors } from '@/shared/theme';

export function Select({ options, size = 'md', style, ...props }: SelectProps) {
  const colors = useColors();
  const height = size === 'sm' ? '3.6rem' : size === 'lg' ? '4.4rem' : '4rem';
  const fontSize = size === 'sm' ? '1.4rem' : size === 'lg' ? '1.8rem' : '1.6rem';

  return (
    <select
      style={{
        width: '100%',
        height,
        padding: '0 1.2rem',
        borderRadius: '0.8rem',
        border: `1px solid ${colors.border.default}`,
        backgroundColor: colors.bg.elevated,
        color: colors.text.primary,
        fontSize,
        outline: 'none',
        ...style,
      }}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

