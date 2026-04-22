import { motion } from 'framer-motion';
import { forwardRef } from 'react';

import type { BaseButtonProps } from '../model/types';

export const BaseButton = forwardRef<HTMLButtonElement, BaseButtonProps>(function BaseButton(
  { children, isLoading = false, loadingContent, disabled, ...props },
  ref,
) {
  return (
    <motion.button ref={ref} disabled={disabled || isLoading} {...props}>
      {isLoading ? loadingContent ?? 'Loading...' : children}
    </motion.button>
  );
});

