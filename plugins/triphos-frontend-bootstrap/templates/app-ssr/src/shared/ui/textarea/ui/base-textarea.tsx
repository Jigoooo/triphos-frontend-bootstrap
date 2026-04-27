import type { BaseTextareaProps } from '../model/types';

export function BaseTextarea(
  {
    hasError: _hasError,
    ref,
    ...props
  }: BaseTextareaProps,
) {
  return <textarea ref={ref} {...props} />;
}
