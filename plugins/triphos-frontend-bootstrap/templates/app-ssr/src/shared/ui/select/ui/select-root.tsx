import {
  autoUpdate,
  flip,
  offset,
  size,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';
import { useEffect, useState } from 'react';

import { SelectContextProvider } from '../model/select-context';
import type {
  ExtendedValue,
  MultiSelectRootProps,
  SelectContextValue,
  SelectRegisteredItem,
  SelectRootProps,
} from '../model/types';

type SelectRootBaseProps<ValueType extends ExtendedValue> = {
  children: React.ReactNode;
  multiple: boolean;
  disabled: boolean;
  size: 'sm' | 'md' | 'lg';
  placeholder: string;
  maxVisibleValues?: number | undefined;
  selectedValue: ValueType | undefined;
  selectedValues: ValueType[];
  onSelectValue: (value: ValueType) => void;
  onToggleValue: (value: ValueType) => void;
};

function SelectRootBase<ValueType extends ExtendedValue>({
  children,
  multiple,
  disabled,
  size: currentSize,
  placeholder,
  maxVisibleValues,
  selectedValue,
  selectedValues,
  onSelectValue,
  onToggleValue,
}: SelectRootBaseProps<ValueType>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null);
  const [items, setItems] = useState<SelectRegisteredItem<ValueType>[]>([]);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    transform: false,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset({
        mainAxis: 8,
      }),
      flip({
        padding: 12,
      }),
      size({
        apply({ rects, elements, availableHeight }) {
          Object.assign(elements.floating.style, {
            minWidth: `${Math.max(rects.reference.width, 240)}px`,
            maxWidth: 'min(34rem, calc(100vw - 2.4rem))',
            maxHeight: `${availableHeight}px`,
          });
        },
        padding: 12,
      }),
    ],
  });

  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'listbox' });
  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss, role]);

  const registerItem = (item: SelectRegisteredItem<ValueType>) => {
    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex((currentItem) => currentItem.id === item.id);

      if (existingIndex === -1) {
        return [...currentItems, item];
      }

      const nextItems = [...currentItems];
      nextItems[existingIndex] = item;
      return nextItems;
    });
  };

  const unregisterItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const getLabelForValue = (value: ValueType) =>
    items.find((item) => item.value === value)?.labelText ?? String(value);

  const focusHighlightedItem = (id: string | null) => {
    if (!id) return;

    const nextItem = items.find((item) => item.id === id);
    nextItem?.ref?.scrollIntoView({
      block: 'nearest',
    });
  };

  const moveHighlight = (direction: 1 | -1) => {
    const enabledItems = items.filter((item) => !item.disabled);
    if (enabledItems.length === 0) return;

    const currentIndex = enabledItems.findIndex((item) => item.id === highlightedItemId);
    const selectedIndex = multiple
      ? enabledItems.findIndex((item) => selectedValues.includes(item.value))
      : enabledItems.findIndex((item) => item.value === selectedValue);

    const baseIndex = currentIndex >= 0 ? currentIndex : selectedIndex >= 0 ? selectedIndex : 0;
    const nextIndex =
      currentIndex === -1 && selectedIndex === -1
        ? direction === 1
          ? 0
          : enabledItems.length - 1
        : (baseIndex + direction + enabledItems.length) % enabledItems.length;

    const nextId = enabledItems[nextIndex]?.id ?? null;
    setHighlightedItemId(nextId);
    focusHighlightedItem(nextId);
  };

  const handleHighlightedSelection = () => {
    const enabledItems = items.filter((item) => !item.disabled);
    const highlightedItem = enabledItems.find((item) => item.id === highlightedItemId) ?? enabledItems[0];

    if (!highlightedItem) return;

    if (multiple) {
      onToggleValue(highlightedItem.value);
      return;
    }

    onSelectValue(highlightedItem.value);
    setIsOpen(false);
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      }
      moveHighlight(1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      }
      moveHighlight(-1);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      handleHighlightedSelection();
      return;
    }

    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    const enabledItems = items.filter((item) => !item.disabled);
    if (enabledItems.length === 0) {
      queueMicrotask(() => {
        if (active) {
          setHighlightedItemId(null);
        }
      });
      return;
    }

    const selectedItem = multiple
      ? enabledItems.find((item) => selectedValues.includes(item.value))
      : enabledItems.find((item) => item.value === selectedValue);

    const nextId = selectedItem?.id ?? enabledItems[0]?.id ?? null;
    queueMicrotask(() => {
      if (!active) return;
      setHighlightedItemId(nextId);
      if (!nextId) return;

      const nextItem = items.find((item) => item.id === nextId);
      nextItem?.ref?.scrollIntoView({
        block: 'nearest',
      });
    });

    return () => {
      active = false;
    };
  }, [isOpen, items, multiple, selectedValue, selectedValues]);

  const contextValue: SelectContextValue<ValueType> = {
    multiple,
    disabled,
    size: currentSize,
    placeholder,
    maxVisibleValues,
    isOpen,
    setIsOpen,
    selectedValue,
    selectedValues,
    selectValue: (value) => {
      onSelectValue(value);
      setIsOpen(false);
    },
    toggleValue: onToggleValue,
    highlightedItemId,
    setHighlightedItemId,
    items,
    registerItem,
    unregisterItem,
    setReference: refs.setReference as (node: HTMLElement | null) => void,
    setFloating: refs.setFloating,
    floatingStyles,
    getReferenceProps,
    getFloatingProps,
    handleTriggerKeyDown,
    getLabelForValue,
  };

  return (
    <SelectContextProvider
      value={
        contextValue as unknown as import('../model/types').SelectContextValue<import('../model/types').ExtendedValue>
      }
    >
      {children}
    </SelectContextProvider>
  );
}

export function SelectRoot<ValueType extends ExtendedValue>({
  children,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  size = 'md',
  placeholder = '옵션을 선택하세요',
}: SelectRootProps<ValueType>) {
  const [internalValue, setInternalValue] = useState<ValueType | undefined>(defaultValue);
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;

  const handleSelectValue = (nextValue: ValueType) => {
    if (!isControlled) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  };

  return (
    <SelectRootBase
      multiple={false}
      disabled={disabled}
      size={size}
      placeholder={placeholder}
      selectedValue={selectedValue}
      selectedValues={selectedValue !== undefined ? [selectedValue] : []}
      onSelectValue={handleSelectValue}
      onToggleValue={handleSelectValue}
    >
      {children}
    </SelectRootBase>
  );
}

export function MultiSelectRoot<ValueType extends ExtendedValue>({
  children,
  values,
  defaultValues,
  onValuesChange,
  disabled = false,
  size = 'md',
  placeholder = '옵션을 선택하세요',
  maxVisibleValues,
}: MultiSelectRootProps<ValueType>) {
  const [internalValues, setInternalValues] = useState<ValueType[]>(defaultValues ?? []);
  const isControlled = values !== undefined;
  const selectedValues = isControlled ? values : internalValues;

  const handleValuesChange = (nextValues: ValueType[]) => {
    if (!isControlled) {
      setInternalValues(nextValues);
    }

    onValuesChange?.(nextValues);
  };

  return (
    <SelectRootBase
      multiple
      disabled={disabled}
      size={size}
      placeholder={placeholder}
      maxVisibleValues={maxVisibleValues}
      selectedValue={undefined}
      selectedValues={selectedValues}
      onSelectValue={() => {}}
      onToggleValue={(nextValue) => {
        if (selectedValues.includes(nextValue)) {
          handleValuesChange(selectedValues.filter((value) => value !== nextValue));
          return;
        }

        handleValuesChange([...selectedValues, nextValue]);
      }}
    >
      {children}
    </SelectRootBase>
  );
}
