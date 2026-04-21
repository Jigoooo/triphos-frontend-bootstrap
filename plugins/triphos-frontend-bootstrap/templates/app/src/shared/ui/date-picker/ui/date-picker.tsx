import { BaseDatePicker } from './base-date-picker';
import type { DatePickerProps } from '../model/types';

export function DatePicker(props: DatePickerProps) {
  return <BaseDatePicker {...props} />;
}

