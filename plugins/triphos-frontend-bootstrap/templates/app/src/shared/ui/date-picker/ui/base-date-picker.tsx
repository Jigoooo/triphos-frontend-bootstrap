import { DatePickerCalendar } from './date-picker-calendar';
import { DatePickerContent } from './date-picker-content';
import { DatePickerRoot } from './date-picker-root';
import { DatePickerTrigger } from './date-picker-trigger';
import type { BaseDatePickerProps } from '../model/types';

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
