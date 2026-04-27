import type { HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

export interface BaseButtonProps extends HTMLMotionProps<'button'> {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingContent?: ReactNode;
}

export interface ButtonProps extends BaseButtonProps {
  variant?: 'solid' | 'outline' | 'ghost';
}
