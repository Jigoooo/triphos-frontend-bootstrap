import {
  autoUpdate,
  flip,
  offset,
  size,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useRole,
} from '@floating-ui/react';

import { DatePickerContextProvider } from '../model/date-picker-context';
import type { DatePickerRootProps } from '../model/types';
import { useDatePicker } from '../model/use-date-picker';

export function DatePickerRoot({
  children,
  mode = 'day',
  value,
  onChange,
  min,
  max,
  dateFormat,
  placeholder = '날짜를 선택하세요',
  disabled = false,
}: DatePickerRootProps) {
  const picker = useDatePicker({
    mode,
    value,
    onChange,
    min,
    max,
    dateFormat,
  });

  const { refs, floatingStyles, context } = useFloating({
    open: picker.isOpen,
    onOpenChange: picker.setIsOpen,
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
            minWidth: `${Math.max(rects.reference.width, 304)}px`,
            maxWidth: 'min(34rem, calc(100vw - 2.4rem))',
            maxHeight: `${availableHeight}px`,
          });
        },
        padding: 12,
      }),
    ],
  });

  const click = useClick(context, {
    enabled: !disabled,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  return (
    <DatePickerContextProvider
      value={{
        mode,
        dateFormat,
        disabled,
        placeholder,
        isOpen: picker.isOpen,
        setIsOpen: picker.setIsOpen,
        selectedDate: picker.selectedDate,
        currentDate: picker.currentDate,
        setCurrentDate: picker.setCurrentDate,
        displayMode: picker.displayMode,
        setDisplayMode: picker.setDisplayMode,
        minDate: picker.minDate,
        maxDate: picker.maxDate,
        commitSelection: picker.commitSelection,
        setReference: refs.setReference as (node: HTMLElement | null) => void,
        setFloating: refs.setFloating,
        floatingStyles,
        getReferenceProps,
        getFloatingProps,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
        }}
      >
        {children}
      </div>
    </DatePickerContextProvider>
  );
}
