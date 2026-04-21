import { useId, useState } from 'react';

import { BaseCheckbox } from './base-checkbox';
import { CheckboxContextProvider } from '../model/checkbox-context';
import type { CheckboxRootProps } from '../model/types';
import { useColors } from '@/shared/theme';

export function CheckboxRoot({
  children,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  size = 'md',
  shape = 'square',
  id: providedId,
  name,
  value,
  style,
}: CheckboxRootProps) {
  const colors = useColors();
  const autoId = useId();
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const isControlled = checked !== undefined;
  const currentChecked = isControlled ? checked : internalChecked;
  const id = providedId || autoId;

  const handleCheckedChange = (nextChecked: boolean) => {
    if (!isControlled) {
      setInternalChecked(nextChecked);
    }

    onCheckedChange?.(nextChecked);
  };

  return (
    <CheckboxContextProvider
      value={{
        checked: currentChecked,
        disabled,
        size,
        shape,
        id,
        isFocusVisible,
      }}
    >
      <label
        htmlFor={id}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.8rem',
          cursor: disabled ? 'default' : 'pointer',
          userSelect: 'none',
          color: colors.text.primary,
          opacity: disabled ? 0.56 : 1,
          ...style,
        }}
      >
        <BaseCheckbox
          id={id}
          name={name}
          value={value}
          checked={currentChecked}
          disabled={disabled}
          onChange={handleCheckedChange}
          onFocus={() => setIsFocusVisible(true)}
          onBlur={() => setIsFocusVisible(false)}
          style={{
            position: 'absolute',
            opacity: 0,
            inset: 0,
            width: 1,
            height: 1,
          }}
        />
        {children}
      </label>
    </CheckboxContextProvider>
  );
}
