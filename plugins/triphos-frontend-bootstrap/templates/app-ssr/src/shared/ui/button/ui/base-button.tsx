import { motion } from 'framer-motion';

import type { BaseButtonProps } from '../model/types';

export function BaseButton(
  { children, isLoading = false, loadingContent, disabled, ref, ...props }: BaseButtonProps,
) {
  return (
    <motion.button ref={ref} disabled={disabled || isLoading} {...props}>
      {isLoading ? loadingContent ?? 'Loading...' : children}
    </motion.button>
  );
}
