import { useDatePickerContext } from '../model/date-picker-context';
import type { DatePickerContentProps } from '../model/types';
import { useColors } from '@/shared/theme';

export function DatePickerContent({ children, style }: DatePickerContentProps) {
  const colors = useColors();
  const { isOpen, setFloating, floatingStyles, getFloatingProps } = useDatePickerContext();

  if (!isOpen) return null;

  return (
    <div
      ref={setFloating}
      style={{
        ...floatingStyles,
        marginTop: '0.2rem',
        padding: '1.2rem',
        borderRadius: '1.6rem',
        border: `1px solid ${colors.border.default}`,
        background: `linear-gradient(180deg, ${colors.bg.elevated}, ${colors.bg.subtle})`,
        boxShadow: `0 28px 64px ${colors.shadow.modal}`,
        overflow: 'auto',
        zIndex: 40,
        ...style,
      }}
      {...getFloatingProps()}
    >
      {children}
    </div>
  );
}
