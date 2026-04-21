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

  return (
    <button
      type='button'
      onClick={onClick}
      style={{
        border: `1px solid ${selected ? colors.interactive.primary : colors.border.default}`,
        borderRadius: '999px',
        backgroundColor: selected ? colors.interactive.primarySurface : colors.bg.elevated,
        color: selected ? colors.interactive.primary : colors.text.primary,
        font: 'inherit',
        fontWeight: 600,
        padding: '0.8rem 1.2rem',
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

