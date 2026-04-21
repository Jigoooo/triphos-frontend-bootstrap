import { ChevronDown } from 'lucide-react';

import { SelectValue } from './select-value';
import { useSelectContext } from '../model/select-context';
import type { SelectTriggerProps } from '../model/types';
import { useColors } from '@/shared/theme';

const HEIGHT_MAP = {
  sm: '3.6rem',
  md: '4rem',
  lg: '4.4rem',
} as const;

const FONT_SIZE_MAP = {
  sm: '1.4rem',
  md: '1.5rem',
  lg: '1.7rem',
} as const;

export function SelectTrigger({ children, style }: SelectTriggerProps) {
  const colors = useColors();
  const {
    disabled,
    size,
    isOpen,
    setIsOpen,
    setReference,
    getReferenceProps,
    handleTriggerKeyDown,
  } = useSelectContext();

  return (
    <button
      ref={setReference}
      type='button'
      disabled={disabled}
      onClick={() => setIsOpen(!isOpen)}
      onKeyDown={handleTriggerKeyDown}
      {...getReferenceProps()}
      style={{
        width: '100%',
        minHeight: HEIGHT_MAP[size],
        padding: '0.85rem 1.2rem',
        borderRadius: '1.1rem',
        border: `1px solid ${isOpen ? colors.border.focus : colors.border.default}`,
        backgroundColor: colors.bg.elevated,
        color: colors.text.primary,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.8rem',
        cursor: disabled ? 'default' : 'pointer',
        boxShadow: isOpen ? `0 0 0 4px ${colors.bg.overlayHover}` : `0 12px 30px -24px ${colors.shadow.floating}`,
        opacity: disabled ? 0.56 : 1,
        fontSize: FONT_SIZE_MAP[size],
        textAlign: 'left',
        ...style,
      }}
    >
      <span
        style={{
          minWidth: 0,
          flex: 1,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {children ?? <SelectValue />}
      </span>
      <ChevronDown
        size={18}
        color={colors.text.tertiary}
        style={{
          flexShrink: 0,
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.16s ease',
        }}
      />
    </button>
  );
}
