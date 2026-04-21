import type { ComponentPropsWithRef, RefObject } from 'react';

export interface BaseTextareaProps extends ComponentPropsWithRef<'textarea'> {
  hasError?: boolean;
}

export interface TextareaProps extends BaseTextareaProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'outlined' | 'filled';
  onEnter?: (value: string) => void;
  autoResize?: boolean;
  maxRows?: number;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  scrollContainerRef?: RefObject<HTMLElement | null>;
}

