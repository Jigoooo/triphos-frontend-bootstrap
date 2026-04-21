import { forwardRef } from 'react';

import type { BaseInputProps } from '../model/types';

export const BaseInput = forwardRef<HTMLInputElement, BaseInputProps>(function BaseInput(
  props,
  ref,
) {
  return <input ref={ref} {...props} />;
});

