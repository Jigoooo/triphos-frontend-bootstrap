import { forwardRef } from 'react';

import { BaseButton } from './base-button';
import type { BaseButtonProps } from '../model/types';

export const RawButton = forwardRef<HTMLButtonElement, BaseButtonProps>(function RawButton(
  props,
  ref,
) {
  return <BaseButton ref={ref} {...props} />;
});

