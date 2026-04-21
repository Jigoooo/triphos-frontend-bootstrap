import { CalendarDays, ChevronDown } from 'lucide-react';

import { formatPickerDate } from '../lib/date-picker-values';
import { useDatePickerContext } from '../model/date-picker-context';
import type { DatePickerTriggerProps } from '../model/types';
import { useColors } from '@/shared/theme';

export function DatePickerTrigger({ placeholder, style }: DatePickerTriggerProps) {
  const colors = useColors();
  const {
    mode,
    dateFormat,
    disabled,
    selectedDate,
    placeholder: contextPlaceholder,
    setReference,
    getReferenceProps,
  } = useDatePickerContext();

  const label = selectedDate ? formatPickerDate(selectedDate, mode, dateFormat) : '';

  return (
    <button
      ref={setReference}
      type='button'
      disabled={disabled}
      {...getReferenceProps()}
      style={{
        width: '100%',
        minHeight: '4rem',
        padding: '0.9rem 1.2rem',
        borderRadius: '1.1rem',
        border: `1px solid ${colors.border.default}`,
        backgroundColor: colors.bg.elevated,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.8rem',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        boxShadow: `0 10px 26px -22px ${colors.shadow.floating}`,
        textAlign: 'left',
        ...style,
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.8rem',
          minWidth: 0,
          color: label ? colors.text.primary : colors.text.tertiary,
          fontSize: '1.5rem',
          lineHeight: 1.4,
        }}
      >
        <CalendarDays
          size={18}
          color={label ? colors.interactive.primary : colors.text.tertiary}
        />
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {label || placeholder || contextPlaceholder}
        </span>
      </span>
      <ChevronDown size={18} color={colors.text.tertiary} />
    </button>
  );
}
