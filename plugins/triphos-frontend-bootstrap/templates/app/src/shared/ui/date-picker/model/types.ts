export type DatePickerProps = {
  value?: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
};

export type BaseDatePickerProps = DatePickerProps;

export type CalendarDay = {
  value: string;
  label: string;
};

export type UseDatePickerReturn = {
  value: string;
  setValue: (value: string) => void;
};

