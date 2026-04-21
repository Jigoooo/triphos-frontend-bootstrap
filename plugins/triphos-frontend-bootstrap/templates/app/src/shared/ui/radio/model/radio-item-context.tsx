import { createContext, useContext } from 'react';

import type { RadioItemContextValue } from './types';

const RadioItemContext = createContext<RadioItemContextValue | null>(null);

export const RadioItemContextProvider = RadioItemContext.Provider;

export function useRadioItemContext() {
  const context = useContext(RadioItemContext);

  if (!context) {
    throw new Error('RadioGroup.Item subcomponents must be used within RadioGroup.Item.');
  }

  return context;
}
