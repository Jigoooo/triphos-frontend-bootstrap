import type { BaseDatePickerProps } from '../model/types';
import { DatePickerCalendar } from './date-picker-calendar';
import { DatePickerContent } from './date-picker-content';
import { DatePickerRoot } from './date-picker-root';
import { DatePickerTrigger } from './date-picker-trigger';

export function BaseDatePicker(props: BaseDatePickerProps) {
  return (
    <DatePickerRoot {...props}>
      <DatePickerTrigger />
      <DatePickerContent>
        <DatePickerCalendar />
      </DatePickerContent>
    </DatePickerRoot>
  );
}
