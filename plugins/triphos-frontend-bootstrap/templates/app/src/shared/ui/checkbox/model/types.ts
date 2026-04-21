import type { InputHTMLAttributes } from 'react';

export interface BaseCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'size'> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface CheckboxProps extends BaseCheckboxProps {
  shape?: 'square' | 'round';
}

