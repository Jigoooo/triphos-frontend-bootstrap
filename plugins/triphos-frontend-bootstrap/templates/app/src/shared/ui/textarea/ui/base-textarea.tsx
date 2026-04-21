import { forwardRef } from 'react';

import type { BaseTextareaProps } from '../model/types';

export const BaseTextarea = forwardRef<HTMLTextAreaElement, BaseTextareaProps>(function BaseTextarea(
  props,
  ref,
) {
  return <textarea ref={ref} {...props} />;
});

