import { RadioGroupItem } from './radio-group-item';
import { RadioGroupIndicator } from './radio-group-indicator';
import { RadioGroupLabel } from './radio-group-label';
import type { ExtendedValue, RadioProps } from '../model/types';

export function Radio<Value extends ExtendedValue>({
  label,
  value,
  disabled,
  size,
  style,
}: RadioProps<Value>) {
  return (
    <RadioGroupItem value={value} disabled={disabled} size={size} style={style}>
      <RadioGroupIndicator />
      <RadioGroupLabel>{label}</RadioGroupLabel>
    </RadioGroupItem>
  );
}
