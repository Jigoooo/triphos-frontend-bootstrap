import type { BaseInputProps } from '../model/types';

export function BaseInput(
  {
    hasError: _hasError,
    ref,
    ...props
  }: BaseInputProps,
) {
  return <input ref={ref} {...props} />;
}
