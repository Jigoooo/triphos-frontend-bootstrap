import type { SwitchProps } from '../model/types';
import { useColors } from '@/shared/theme';

export function Switch({ checked, onChange, disabled }: SwitchProps) {
  const colors = useColors();

  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        width: '4.8rem',
        height: '2.8rem',
        borderRadius: '999px',
        border: `1px solid ${checked ? colors.interactive.primary : colors.border.default}`,
        backgroundColor: checked ? colors.interactive.primary : colors.bg.subtle,
        padding: '0.3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '50%',
          backgroundColor: colors.bg.elevated,
          display: 'block',
        }}
      />
    </button>
  );
}

