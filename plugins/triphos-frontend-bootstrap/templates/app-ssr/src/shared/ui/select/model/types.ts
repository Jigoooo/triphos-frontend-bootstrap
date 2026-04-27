import type { CSSProperties, ReactNode } from 'react';

export type ExtendedValue = string | number;
export type SelectSize = 'sm' | 'md' | 'lg';

export type SelectOption<ValueType extends ExtendedValue = string> = {
  label: string;
  value: ValueType;
  disabled?: boolean | undefined;
};

export type SelectChangeEvent<ValueType extends ExtendedValue> = {
  target: {
    value: ValueType;
  };
};

export type SelectRootProps<ValueType extends ExtendedValue = string> = {
  children: ReactNode;
  value?: ValueType | undefined;
  defaultValue?: ValueType | undefined;
  onValueChange?: ((value: ValueType) => void) | undefined;
  disabled?: boolean | undefined;
  size?: SelectSize | undefined;
  placeholder?: string | undefined;
};

export type MultiSelectRootProps<ValueType extends ExtendedValue = string> = {
  children: ReactNode;
  values?: ValueType[] | undefined;
  defaultValues?: ValueType[] | undefined;
  onValuesChange?: ((values: ValueType[]) => void) | undefined;
  disabled?: boolean | undefined;
  size?: SelectSize | undefined;
  placeholder?: string | undefined;
  maxVisibleValues?: number | undefined;
};

export type SelectTriggerProps = {
  children?: ReactNode;
  style?: CSSProperties | undefined;
};

export type SelectValueProps = {
  placeholder?: string | undefined;
  style?: CSSProperties | undefined;
};

export type SelectContentProps = {
  children: ReactNode;
  style?: CSSProperties | undefined;
};

export type SelectItemProps<ValueType extends ExtendedValue = string> = {
  children: ReactNode;
  value: ValueType;
  disabled?: boolean | undefined;
  textValue?: string | undefined;
  style?: CSSProperties | undefined;
};

export type SelectProps<ValueType extends ExtendedValue = string> = {
  options: SelectOption<ValueType>[];
  value?: ValueType | undefined;
  defaultValue?: ValueType | undefined;
  onValueChange?: ((value: ValueType) => void) | undefined;
  onChange?: ((event: SelectChangeEvent<ValueType>) => void) | undefined;
  disabled?: boolean | undefined;
  size?: SelectSize | undefined;
  placeholder?: string | undefined;
};

export type MultiSelectProps<ValueType extends ExtendedValue = string> = {
  options: SelectOption<ValueType>[];
  values?: ValueType[] | undefined;
  defaultValues?: ValueType[] | undefined;
  onValuesChange?: ((values: ValueType[]) => void) | undefined;
  disabled?: boolean | undefined;
  size?: SelectSize | undefined;
  placeholder?: string | undefined;
  maxVisibleValues?: number | undefined;
};

export type SelectRegisteredItem<ValueType extends ExtendedValue = ExtendedValue> = {
  id: string;
  value: ValueType;
  labelText: string;
  disabled: boolean;
  ref: HTMLButtonElement | null;
};

export type SelectContextValue<ValueType extends ExtendedValue = ExtendedValue> = {
  multiple: boolean;
  disabled: boolean;
  size: SelectSize;
  placeholder: string;
  maxVisibleValues?: number | undefined;
  isOpen: boolean;
  setIsOpen: (next: boolean) => void;
  selectedValue: ValueType | undefined;
  selectedValues: ValueType[];
  selectValue: (value: ValueType) => void;
  toggleValue: (value: ValueType) => void;
  highlightedItemId: string | null;
  setHighlightedItemId: (id: string | null) => void;
  items: SelectRegisteredItem<ValueType>[];
  registerItem: (item: SelectRegisteredItem<ValueType>) => void;
  unregisterItem: (id: string) => void;
  setReference: (node: HTMLElement | null) => void;
  setFloating: (node: HTMLElement | null) => void;
  floatingStyles: CSSProperties;
  getReferenceProps: (userProps?: Record<string, unknown>) => Record<string, unknown>;
  getFloatingProps: (userProps?: Record<string, unknown>) => Record<string, unknown>;
  handleTriggerKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  getLabelForValue: (value: ValueType) => string;
};
