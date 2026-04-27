import { createContext, useContext } from 'react';

import type { ExtendedValue, RadioGroupContextValue } from './types';

const RadioGroupContext = createContext<RadioGroupContextValue<ExtendedValue> | null>(null);

export const RadioGroupContextProvider = RadioGroupContext.Provider;

export function useRadioGroupContext<Value extends ExtendedValue>() {
  const context = useContext(RadioGroupContext);

  if (!context) {
    throw new Error('RadioGroup compound components must be used within RadioGroup.Root.');
  }

  return context as unknown as RadioGroupContextValue<Value>;
}
