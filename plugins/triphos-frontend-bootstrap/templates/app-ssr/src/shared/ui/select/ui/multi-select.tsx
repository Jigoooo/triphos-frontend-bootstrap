import { SelectContent } from './select-content';
import { SelectItem } from './select-item';
import { MultiSelectRoot } from './select-root';
import { SelectTrigger } from './select-trigger';
import { SelectValue } from './select-value';
import type { ExtendedValue, MultiSelectProps } from '../model/types';

function MultiSelectField<ValueType extends ExtendedValue>({
  options,
  values,
  defaultValues,
  onValuesChange,
  disabled,
  size,
  placeholder,
  maxVisibleValues,
}: MultiSelectProps<ValueType>) {
  return (
    <MultiSelectRoot
      values={values}
      defaultValues={defaultValues}
      onValuesChange={onValuesChange}
      disabled={disabled}
      size={size}
      placeholder={placeholder}
      maxVisibleValues={maxVisibleValues}
    >
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={String(option.value)}
            value={option.value}
            disabled={option.disabled}
            textValue={option.label}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </MultiSelectRoot>
  );
}

export const MultiSelect = Object.assign(MultiSelectField, {
  Root: MultiSelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Content: SelectContent,
  Item: SelectItem,
});
