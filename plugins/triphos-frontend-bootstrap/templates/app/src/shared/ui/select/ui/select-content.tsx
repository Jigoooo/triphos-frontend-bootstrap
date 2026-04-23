import { useSelectContext } from '../model/select-context';
import type { SelectContentProps } from '../model/types';
import { useColors } from '@/shared/theme';

export function SelectContent({ children, style }: SelectContentProps) {
  const colors = useColors();
  const { isOpen, setFloating, floatingStyles, getFloatingProps } = useSelectContext();

  return (
    <div
      ref={setFloating}
      style={{
        ...floatingStyles,
        visibility: isOpen ? 'visible' : 'hidden',
        pointerEvents: isOpen ? 'auto' : 'none',
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-6px) scale(0.98)',
        transition: 'opacity 0.14s ease, transform 0.14s ease, visibility 0.14s ease',
        marginTop: '0.2rem',
        padding: '0.6rem',
        borderRadius: '1.4rem',
        border: `1px solid ${colors.border.default}`,
        backgroundColor: colors.bg.elevated,
        boxShadow: `0 24px 60px ${colors.shadow.modal}`,
        overflowY: 'auto',
        backdropFilter: 'blur(14px)',
        zIndex: 40,
        ...style,
      }}
      {...getFloatingProps()}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
        }}
      >
        {children}
      </div>
    </div>
  );
}
