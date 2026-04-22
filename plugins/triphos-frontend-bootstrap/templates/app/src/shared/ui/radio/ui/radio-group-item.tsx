import { useId, useState } from 'react';

import { useRadioGroupContext } from '../model/radio-group-context';
import { RadioItemContextProvider } from '../model/radio-item-context';
import type { ExtendedValue, RadioGroupItemProps } from '../model/types';
import { useColors } from '@/shared/theme';

export function RadioGroupItem<Value extends ExtendedValue>({
  children,
  value,
  disabled = false,
  size,
  style,
  id: providedId,
  ...props
}: RadioGroupItemProps<Value>) {
  const colors = useColors();
  const autoId = useId();
  const group = useRadioGroupContext<Value>();
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const id = providedId || autoId;
  const currentSize = size || group.size;
  const currentDisabled = disabled || group.disabled;
  const checked = group.selectedValue === value;

  return (
    <RadioItemContextProvider
      value={{
        checked,
        disabled: currentDisabled,
        size: currentSize,
        isFocusVisible,
      }}
    >
      <label
        htmlFor={id}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.8rem',
          cursor: currentDisabled ? 'default' : 'pointer',
          color: colors.text.primary,
          opacity: currentDisabled ? 0.56 : 1,
          userSelect: 'none',
          ...style,
        }}
      >
        <input
          {...props}
          id={id}
          type='radio'
          name={group.name}
          checked={checked}
          value={String(value)}
          disabled={currentDisabled}
          onChange={() => group.onValueChange?.(value)}
          onFocus={() => setIsFocusVisible(true)}
          onBlur={() => setIsFocusVisible(false)}
          style={{
            position: 'absolute',
            opacity: 0,
            width: 1,
            height: 1,
          }}
        />
        {children}
      </label>
    </RadioItemContextProvider>
  );
}
