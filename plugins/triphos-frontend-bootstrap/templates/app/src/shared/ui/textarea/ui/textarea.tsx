import { type ChangeEvent, type KeyboardEvent, useCallback, useLayoutEffect, useRef } from 'react';

import { BaseTextarea } from './base-textarea';
import type { TextareaProps } from '../model/types';
import { ResolvedThemeMode, useColors, useThemeStore } from '@/shared/theme';

const SIZE_FONT: Record<string, string> = {
  sm: '1.4rem',
  md: '1.6rem',
  lg: '1.8rem',
};

const LINE_HEIGHT = 20;
const PADDING = 14;

function withScrollPreserved(scrollEl: HTMLElement | null, fn: () => void) {
  const saved = scrollEl?.scrollTop;
  fn();
  if (scrollEl != null && saved != null) {
    scrollEl.scrollTop = saved;
  }
}

export function Textarea({
  size = 'md',
  variant = 'outlined',
  hasError = false,
  disabled,
  style,
  onEnter,
  onKeyDown,
  onChange,
  autoResize = false,
  maxRows = 5,
  textareaRef: externalTextareaRef,
  scrollContainerRef,
  value,
  ...props
}: TextareaProps) {
  const colors = useColors();
  const resolvedMode = useThemeStore((state) => state.resolvedMode);
  const internalTextareaRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = externalTextareaRef ?? internalTextareaRef;

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(event);

      if (autoResize) {
        const element = event.target;
        withScrollPreserved(scrollContainerRef?.current ?? null, () => {
          element.style.height = 'auto';
          const maxHeight = LINE_HEIGHT * maxRows + PADDING;
          element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`;
        });
      }
    },
    [autoResize, maxRows, onChange, scrollContainerRef],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.nativeEvent.isComposing) return;

      if (event.key === 'Enter' && !event.shiftKey && onEnter && textareaRef.current) {
        event.preventDefault();
        onEnter(textareaRef.current.value);
      }

      onKeyDown?.(event);
    },
    [onEnter, onKeyDown, textareaRef],
  );

  useLayoutEffect(() => {
    if (!autoResize || !textareaRef.current) return;

    const element = textareaRef.current;
    withScrollPreserved(scrollContainerRef?.current ?? null, () => {
      element.style.height = 'auto';
      const maxHeight = LINE_HEIGHT * maxRows + PADDING;
      element.style.height = `${Math.min(element.scrollHeight, maxHeight)}px`;
    });
  }, [autoResize, maxRows, scrollContainerRef, textareaRef, value]);

  return (
    <BaseTextarea
      ref={textareaRef}
      disabled={disabled}
      hasError={hasError}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      style={{
        width: '100%',
        background: variant === 'filled' ? colors.bg.subtle : colors.bg.elevated,
        border: `1px solid ${hasError ? colors.feedback.error : colors.border.default}`,
        borderRadius: '0.8rem',
        padding: '1.2rem',
        fontSize: SIZE_FONT[size] || SIZE_FONT.md,
        outline: 'none',
        resize: 'none',
        lineHeight: `${LINE_HEIGHT}px`,
        fontFamily: 'inherit',
        color: colors.text.primary,
        caretColor: colors.interactive.primary,
        colorScheme: resolvedMode === ResolvedThemeMode.Dark ? 'dark' : 'light',
        ...(autoResize && {
          maxHeight: `${LINE_HEIGHT * maxRows + PADDING}px`,
          overflow: typeof value === 'string' && value.split('\n').length > maxRows ? 'auto' : 'hidden',
        }),
        ...style,
      }}
      {...props}
    />
  );
}
