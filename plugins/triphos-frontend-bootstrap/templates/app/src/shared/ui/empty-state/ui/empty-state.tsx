import { type ReactNode } from 'react';
import { useColors } from '@/shared/theme';

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const colors = useColors();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
        padding: '2rem',
        borderRadius: '1.6rem',
        border: `1px dashed ${colors.border.default}`,
        backgroundColor: colors.bg.subtle,
        textAlign: 'center',
      }}
    >
      <strong style={{ fontSize: '1.8rem', color: colors.text.primary }}>{title}</strong>
      {description ? <p style={{ fontSize: '1.4rem', color: colors.text.secondary }}>{description}</p> : null}
      {action}
    </div>
  );
}

