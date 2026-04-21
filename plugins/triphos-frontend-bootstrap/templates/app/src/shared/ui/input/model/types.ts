import type { ComponentPropsWithRef, ReactNode } from 'react';

export interface BaseInputProps extends Omit<ComponentPropsWithRef<'input'>, 'size'> {
  hasError?: boolean;
}

export interface InputProps extends BaseInputProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled';
  startDecorator?: ReactNode;
  endDecorator?: ReactNode;
  onEnter?: (value: string) => void;
}

