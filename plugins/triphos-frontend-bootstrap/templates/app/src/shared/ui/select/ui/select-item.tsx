import { Check } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';

import { useSelectContext } from '../model/select-context';
import type { ExtendedValue, SelectItemProps } from '../model/types';
import { useColors } from '@/shared/theme';

function deriveLabelText<ValueType extends ExtendedValue>(
  children: React.ReactNode,
  textValue: string | undefined,
  value: ValueType,
) {
  if (textValue) return textValue;
  if (typeof children === 'string') return children;
  return String(value);
}

export function SelectItem<ValueType extends ExtendedValue>({
  children,
  value,
  disabled = false,
  textValue,
  style,
}: SelectItemProps<ValueType>) {
  const colors = useColors();
  const itemId = useId();
  const itemRef = useRef<HTMLButtonElement>(null);
  const {
    multiple,
    selectedValue,
    selectedValues,
    highlightedItemId,
    registerItem,
    unregisterItem,
    setHighlightedItemId,
    selectValue,
    toggleValue,
  } = useSelectContext<ValueType>();

  const selected = multiple ? selectedValues.includes(value) : selectedValue === value;
  const labelText = deriveLabelText(children, textValue, value);

  useEffect(() => {
    registerItem({
      id: itemId,
      value,
      labelText,
      disabled,
      ref: itemRef.current,
    });

    return () => {
      unregisterItem(itemId);
    };
  }, [disabled, itemId, labelText, registerItem, unregisterItem, value]);

  return (
    <button
      ref={itemRef}
      type='button'
      disabled={disabled}
      data-select-item='true'
      data-select-item-id={itemId}
      onMouseEnter={() => setHighlightedItemId(itemId)}
      onClick={() => {
        if (disabled) return;

        if (multiple) {
          toggleValue(value);
          return;
        }

        selectValue(value);
      }}
      style={{
        minHeight: '4rem',
        borderRadius: '1rem',
        border: `1px solid ${selected ? colors.interactive.primary : colors.border.default}`,
        backgroundColor: selected
          ? colors.interactive.primarySurface
          : highlightedItemId === itemId
            ? colors.bg.subtle
            : colors.bg.elevated,
        color: disabled ? colors.text.disabled : colors.text.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.8rem',
        padding: '0.9rem 1rem',
        cursor: disabled ? 'default' : 'pointer',
        textAlign: 'left',
        opacity: disabled ? 0.56 : 1,
        ...style,
      }}
    >
      <span
        style={{
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontSize: '1.45rem',
        }}
      >
        {children}
      </span>
      {selected ? (
        <Check
          size={16}
          color={multiple ? colors.interactive.primary : colors.interactive.primary}
          style={{ flexShrink: 0 }}
        />
      ) : null}
    </button>
  );
}
