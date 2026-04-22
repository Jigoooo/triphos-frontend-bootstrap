import { type KeyboardEvent, useRef } from 'react';

import { BaseInput } from './base-input';
import type { InputProps } from '../model/types';
import { ResolvedThemeMode, useColors, useThemeStore } from '@/shared/theme';

const SIZE_HEIGHT: Record<string, string> = {
  sm: '3.6rem',
  md: '4rem',
  lg: '4.4rem',
};

const SIZE_FONT: Record<string, string> = {
  sm: '1.4rem',
  md: '1.6rem',
  lg: '1.8rem',
};

export function Input({
  size = 'md',
  variant = 'outlined',
  hasError = false,
  disabled,
  style,
  startDecorator,
  endDecorator,
  onEnter,
  onKeyDown,
  ...props
}: InputProps) {
  const colors = useColors();
  const resolvedMode = useThemeStore((state) => state.resolvedMode);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;

    if (event.key === 'Enter' && onEnter && inputRef.current) {
      onEnter(inputRef.current.value);
    }

    onKeyDown?.(event);
  };

  const wrapperStyle = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    height: SIZE_HEIGHT[size] || SIZE_HEIGHT['md'],
    padding: '0 1.2rem',
    borderRadius: '0.8rem',
    gap: '0.6rem',
    transition: 'border-color 0.1s ease-in-out, box-shadow 0.1s ease-in-out',
    cursor: disabled ? 'default' : 'text',
    opacity: disabled ? 0.5 : 1,
    backgroundColor: variant === 'filled' ? colors.bg.subtle : colors.bg.elevated,
    border: `1px solid ${hasError ? colors.feedback.error : colors.border.default}`,
    ...style,
  } satisfies React.CSSProperties;

  return (
    <div style={wrapperStyle}>
      {startDecorator ? <div style={{ display: 'flex', alignItems: 'center' }}>{startDecorator}</div> : null}
      <BaseInput
        ref={inputRef}
        disabled={disabled}
        hasError={hasError}
        onKeyDown={handleKeyDown}
        style={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          border: 'none',
          background: 'transparent',
          outline: 'none',
          fontSize: SIZE_FONT[size] || SIZE_FONT['md'],
          lineHeight: 1.5,
          color: colors.text.primary,
          caretColor: colors.interactive.primary,
          colorScheme: resolvedMode === ResolvedThemeMode.Dark ? 'dark' : 'light',
          cursor: disabled ? 'default' : 'text',
        }}
        {...props}
      />
      {endDecorator ? <div style={{ display: 'flex', alignItems: 'center' }}>{endDecorator}</div> : null}
    </div>
  );
}
