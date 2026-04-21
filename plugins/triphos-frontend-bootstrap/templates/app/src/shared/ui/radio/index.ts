export { Radio } from './ui/radio';
export { RadioGroupIndicator } from './ui/radio-group-indicator';
export { RadioGroupItem } from './ui/radio-group-item';
export { RadioGroupLabel } from './ui/radio-group-label';
export { RadioGroupRoot } from './ui/radio-group-root';

import { RadioGroupRoot } from './ui/radio-group-root';
import { RadioGroupItem } from './ui/radio-group-item';
import { RadioGroupIndicator } from './ui/radio-group-indicator';
import { RadioGroupLabel } from './ui/radio-group-label';

export const RadioGroup = Object.assign(RadioGroupRoot, {
  Root: RadioGroupRoot,
  Item: RadioGroupItem,
  Indicator: RadioGroupIndicator,
  Label: RadioGroupLabel,
});

export type {
  ExtendedValue,
  RadioGroupContextValue,
  RadioGroupItemProps,
  RadioGroupRootProps,
  RadioIndicatorProps,
  RadioItemContextValue,
  RadioLabelProps,
  RadioProps,
  RadioSize,
} from './model/types';
