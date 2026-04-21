import { useId, useState } from 'react';

import { RadioGroupContextProvider } from '../model/radio-group-context';
import type { ExtendedValue, RadioGroupRootProps } from '../model/types';

export function RadioGroupRoot<Value extends ExtendedValue>({
  children,
  name,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  orientation = 'vertical',
  size = 'md',
  style,
}: RadioGroupRootProps<Value>) {
  const autoName = useId();
  const groupName = name || `radio-group-${autoName}`;
  const [internalValue, setInternalValue] = useState<Value | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;

  const handleValueChange = (nextValue: Value) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  return (
    <RadioGroupContextProvider
      value={{
        name: groupName,
        selectedValue,
        onValueChange: handleValueChange,
        disabled,
        size,
      } as unknown as import('../model/types').RadioGroupContextValue<import('../model/types').ExtendedValue>}
    >
      <div
        role='radiogroup'
        style={{
          display: 'flex',
          flexDirection: orientation === 'horizontal' ? 'row' : 'column',
          gap: orientation === 'horizontal' ? '1.2rem' : '0.8rem',
          ...style,
        }}
      >
        {children}
      </div>
    </RadioGroupContextProvider>
  );
}
