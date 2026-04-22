import {
  addMonths,
  endOfMonth,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { ko } from 'date-fns/locale';

import { DatePickerNavigationButton } from './date-picker-navigation-button';
import { isDateDisabled } from '../lib/date-picker-values';
import { generateDaysArray } from '../lib/generate-days-array';
import { useDatePickerContext } from '../model/date-picker-context';
import { useColors } from '@/shared/theme';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export function DatePickerDayView() {
  const colors = useColors();
  const {
    currentDate,
    selectedDate,
    minDate,
    maxDate,
    setCurrentDate,
    setDisplayMode,
    commitSelection,
  } = useDatePickerContext();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = generateDaysArray(year, month);

  const disablePrev =
    !!minDate && endOfMonth(subMonths(currentDate, 1)).getTime() < startOfMonth(minDate).getTime();
  const disableNext =
    !!maxDate && startOfMonth(addMonths(currentDate, 1)).getTime() > endOfMonth(maxDate).getTime();

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
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
        />
        <button
          type='button'
          onClick={() => setDisplayMode('month')}
          style={{
            border: 0,
            background: 'transparent',
            color: colors.text.primary,
            fontSize: '1.5rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {format(currentDate, 'yyyy년 MMMM', { locale: ko })}
        </button>
        <DatePickerNavigationButton
          direction='next'
          disabled={disableNext}
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: '0.4rem',
        }}
      >
        {WEEKDAY_LABELS.map((day) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              color: colors.text.tertiary,
              fontSize: '1.2rem',
              fontWeight: 700,
              paddingBottom: '0.2rem',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: '0.4rem',
        }}
      >
        {days.map((day) => {
          const disabled = isDateDisabled(day, minDate, maxDate);
          const currentMonth = isSameMonth(day, currentDate);
          const selected = !!selectedDate && isSameDay(day, selectedDate);
          const today = isToday(day);

          return (
            <button
              key={day.toISOString()}
              type='button'
              disabled={disabled}
              onClick={() => {
                setCurrentDate(day);
                commitSelection(day);
              }}
              style={{
                minHeight: '3.4rem',
                borderRadius: '1rem',
                border: selected
                  ? `1px solid ${colors.interactive.primary}`
                  : today
                    ? `1px solid ${colors.border.focus}`
                    : `1px solid ${currentMonth ? colors.border.default : 'transparent'}`,
                backgroundColor: selected
                  ? colors.interactive.primary
                  : currentMonth
                    ? colors.bg.elevated
                    : colors.bg.subtle,
                color: selected
                  ? colors.text.onBrand
                  : disabled
                    ? colors.text.disabled
                    : currentMonth
                      ? colors.text.primary
                      : colors.text.secondary,
                fontSize: '1.35rem',
                fontWeight: selected ? 700 : 500,
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.55 : 1,
              }}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
