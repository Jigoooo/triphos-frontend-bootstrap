import { CheckboxIndicator } from './checkbox-indicator';
import { CheckboxLabel } from './checkbox-label';
import { CheckboxRoot } from './checkbox-root';
import type { CheckboxProps } from '../model/types';

function CheckboxField({
  size = 'md',
  shape = 'square',
  checked = false,
  onChange,
  disabled,
  label,
  defaultChecked,
  id,
  name,
  value,
  style,
}: CheckboxProps) {
  return (
    <CheckboxRoot
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={onChange}
      disabled={disabled}
      size={size}
      shape={shape}
      id={id}
      name={name}
      value={typeof value === 'string' ? value : undefined}
      style={style}
    >
      <CheckboxIndicator />
      {label ? <CheckboxLabel>{label}</CheckboxLabel> : null}
    </CheckboxRoot>
  );
}

export const Checkbox = Object.assign(CheckboxField, {
  Root: CheckboxRoot,
  Indicator: CheckboxIndicator,
  Label: CheckboxLabel,
});
