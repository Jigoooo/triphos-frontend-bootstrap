import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react';

export type ExtendedValue = string | number;
export type RadioSize = 'sm' | 'md' | 'lg';

export interface RadioGroupRootProps<Value extends ExtendedValue> {
  children: ReactNode;
  name?: string | undefined;
  value?: Value | undefined;
  defaultValue?: Value | undefined;
  onValueChange?: ((value: Value) => void) | undefined;
  disabled?: boolean | undefined;
  orientation?: 'vertical' | 'horizontal' | undefined;
  size?: RadioSize | undefined;
  style?: CSSProperties | undefined;
}

export interface RadioGroupItemProps<Value extends ExtendedValue>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'size' | 'children' | 'onChange'> {
  children: ReactNode;
  value: Value;
  disabled?: boolean | undefined;
  size?: RadioSize | undefined;
  style?: CSSProperties | undefined;
}

export interface RadioIndicatorProps {
  style?: CSSProperties | undefined;
}

export interface RadioLabelProps {
  children: ReactNode;
  style?: CSSProperties | undefined;
}

export interface RadioProps<Value extends ExtendedValue> {
  label: string;
  value: Value;
  disabled?: boolean | undefined;
  size?: RadioSize | undefined;
  style?: CSSProperties | undefined;
}

export interface RadioGroupContextValue<Value extends ExtendedValue> {
  name: string;
  selectedValue: Value | undefined;
  onValueChange?: ((value: Value) => void) | undefined;
  disabled: boolean;
  size: RadioSize;
}

export interface RadioItemContextValue {
  checked: boolean;
  disabled: boolean;
  size: RadioSize;
  isFocusVisible: boolean;
}
