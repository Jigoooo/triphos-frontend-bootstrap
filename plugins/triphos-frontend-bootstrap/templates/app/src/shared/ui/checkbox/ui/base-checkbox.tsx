import type { BaseCheckboxProps } from '../model/types';

export function BaseCheckbox({
  label: _label,
  size: _size,
  onChange: _onChange,
  ...props
}: BaseCheckboxProps) {
  return <input type='checkbox' {...props} />;
}
