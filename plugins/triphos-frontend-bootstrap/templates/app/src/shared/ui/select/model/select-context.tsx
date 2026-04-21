import { createContext, useContext } from 'react';

import type { ExtendedValue, SelectContextValue } from './types';

const SelectContext = createContext<SelectContextValue<ExtendedValue> | null>(null);

export const SelectContextProvider = SelectContext.Provider;

export function useSelectContext<ValueType extends ExtendedValue>() {
  const context = useContext(SelectContext);

  if (!context) {
    throw new Error('Select compound components must be used within Select.Root or MultiSelect.Root.');
  }

  return context as unknown as SelectContextValue<ValueType>;
}
