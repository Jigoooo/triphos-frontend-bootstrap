import { useState } from 'react';

import type { UseDatePickerReturn } from './types';

export function useDatePicker(initialValue = ''): UseDatePickerReturn {
  const [value, setValue] = useState(initialValue);
  return { value, setValue };
}

