import { addYears, endOfMonth, format, isSameMonth, isSameYear, setMonth, startOfMonth, subYears } from 'date-fns';
import { ko } from 'date-fns/locale';

import { DatePickerNavigationButton } from './date-picker-navigation-button';
import { useDatePickerContext } from '../model/date-picker-context';
import { useColors } from '@/shared/theme';

const MONTH_LABELS = Array.from({ length: 12 }, (_, index) =>
  format(new Date(2026, index, 1), 'M월', { locale: ko }),
);

export function DatePickerMonthView() {
  const colors = useColors();
  const {
    mode,
    currentDate,
    selectedDate,
    minDate,
    maxDate,
    setCurrentDate,
    setDisplayMode,
    commitSelection,
  } = useDatePickerContext();

  const disablePrev =
    !!minDate && subYears(currentDate, 1).getTime() < startOfMonth(minDate).getTime();
  const disableNext =
    !!maxDate && addYears(currentDate, 1).getTime() > endOfMonth(maxDate).getTime();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        <DatePickerNavigationButton
          direction='prev'
          disabled={disablePrev}
          onClick={() => setCurrentDate(subYears(currentDate, 1))}
        />
        <button
          type='button'
          onClick={() => setDisplayMode('year')}
          style={{
            border: 0,
            background: 'transparent',
            color: colors.text.primary,
            fontSize: '1.5rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {format(currentDate, 'yyyy년', { locale: ko })}
        </button>
        <DatePickerNavigationButton
          direction='next'
          disabled={disableNext}
          onClick={() => setCurrentDate(addYears(currentDate, 1))}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '0.6rem',
        }}
      >
        {MONTH_LABELS.map((monthLabel, monthIndex) => {
          const targetDate = setMonth(currentDate, monthIndex);
          const disabled =
            (!!minDate && endOfMonth(targetDate).getTime() < startOfMonth(minDate).getTime()) ||
            (!!maxDate && startOfMonth(targetDate).getTime() > endOfMonth(maxDate).getTime());
          const selected =
            !!selectedDate &&
            isSameMonth(targetDate, selectedDate) &&
            isSameYear(targetDate, selectedDate);

          return (
            <button
              key={monthLabel}
              type='button'
              disabled={disabled}
              onClick={() => {
                setCurrentDate(targetDate);
                if (mode === 'month') {
                  commitSelection(targetDate);
                  return;
                }
                setDisplayMode('day');
              }}
              style={{
                minHeight: '4rem',
                borderRadius: '1.2rem',
                border: `1px solid ${selected ? colors.interactive.primary : colors.border.default}`,
                backgroundColor: selected ? colors.interactive.primary : colors.bg.elevated,
                color: selected
                  ? colors.text.onBrand
                  : disabled
                    ? colors.text.disabled
                    : colors.text.primary,
                fontSize: '1.4rem',
                fontWeight: selected ? 700 : 500,
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {monthLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}
