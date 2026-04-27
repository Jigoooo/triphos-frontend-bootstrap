import type { CSSProperties, InputHTMLAttributes, ReactNode } from 'react';

export type CheckboxSize = 'sm' | 'md' | 'lg';
export type CheckboxShape = 'square' | 'round';

export interface BaseCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'size'> {
  checked?: boolean | undefined;
  defaultChecked?: boolean | undefined;
  onChange?: ((checked: boolean) => void) | undefined;
  label?: string | undefined;
  size?: CheckboxSize | undefined;
}

export interface CheckboxProps extends BaseCheckboxProps {
  shape?: CheckboxShape | undefined;
}

export interface CheckboxRootProps {
  children: ReactNode;
  checked?: boolean | undefined;
  defaultChecked?: boolean | undefined;
  onCheckedChange?: ((checked: boolean) => void) | undefined;
  disabled?: boolean | undefined;
  size?: CheckboxSize | undefined;
  shape?: CheckboxShape | undefined;
  id?: string | undefined;
  name?: string | undefined;
  value?: string | undefined;
  style?: CSSProperties | undefined;
}

export interface CheckboxIndicatorProps {
  style?: CSSProperties | undefined;
}

export interface CheckboxLabelProps {
  children: ReactNode;
  style?: CSSProperties | undefined;
}

export interface CheckboxContextValue {
  checked: boolean;
  disabled: boolean;
  size: CheckboxSize;
  shape: CheckboxShape;
  id: string;
  isFocusVisible: boolean;
}
