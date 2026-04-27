import type { BaseCheckboxProps } from '../model/types';

export function BaseCheckbox({
  label: _label,
  size: _size,
  onChange,
  ...props
}: BaseCheckboxProps) {
  return <input type='checkbox' onChange={(event) => onChange?.(event.target.checked)} {...props} />;
}
