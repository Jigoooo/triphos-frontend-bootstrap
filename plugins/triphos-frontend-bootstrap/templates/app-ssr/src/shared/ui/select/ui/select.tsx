import { SelectContent } from './select-content';
import { SelectItem } from './select-item';
import { SelectRoot } from './select-root';
import { SelectTrigger } from './select-trigger';
import { SelectValue } from './select-value';
import type { ExtendedValue, SelectProps } from '../model/types';

function SelectField<ValueType extends ExtendedValue>({
  options,
  value,
  defaultValue,
  onValueChange,
  onChange,
  disabled,
  size,
  placeholder,
}: SelectProps<ValueType>) {
  return (
    <SelectRoot
      value={value}
      defaultValue={defaultValue}
      onValueChange={(nextValue) => {
        onValueChange?.(nextValue);
        onChange?.({
          target: {
            value: nextValue,
          },
        });
      }}
      disabled={disabled}
      size={size}
      placeholder={placeholder}
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
    </SelectRoot>
  );
}

export const Select = Object.assign(SelectField, {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Content: SelectContent,
  Item: SelectItem,
});
