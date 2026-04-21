import { useRef, useState } from 'react';

export type FormChangeHandler<T> = <K extends keyof T>(key: K, value: T[K]) => void;
export type PatchFormHandler<T> = (partial: Partial<T>) => void;
export type FormChangeCallback<T> = <K extends keyof T>(key: K, value: T[K], prevValue: T[K]) => void;

export function useFormState<T>(initial: T, options: { onChange?: FormChangeCallback<T> } = {}) {
  const [formState, setFormState] = useState<T>(initial);
  const prevStateRef = useRef<T>(formState);

  const onFormChange: FormChangeHandler<T> = (key, value) => {
    const prevValue = prevStateRef.current[key];
    options.onChange?.(key, value, prevValue);

    setFormState((prev) => {
      const next = { ...prev, [key]: value };
      prevStateRef.current = next;
      return next;
    });
  };

  const patchForm: PatchFormHandler<T> = (partial) => {
    setFormState((prev) => {
      const next = { ...prev, ...partial };
      prevStateRef.current = next;
      return next;
    });
  };

  const resetForm = (excludeKeys: (keyof T)[] = []) => {
    const resetState = excludeKeys.reduce(
      (acc, key) => {
        acc[key] = formState[key];
        return acc;
      },
      { ...initial },
    );

    prevStateRef.current = resetState;
    setFormState(resetState);
  };

  return { formState, onFormChange, patchForm, resetForm, setFormState };
}

