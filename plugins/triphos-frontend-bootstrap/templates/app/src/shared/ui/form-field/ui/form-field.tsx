import { type ReactNode } from 'react';
import { useColors } from '@/shared/theme';

export type FormFieldProps = {
  label?: string;
  description?: string;
  error?: string;
  children: ReactNode;
};

export function FormField({ label, description, error, children }: FormFieldProps) {
  const colors = useColors();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
      {label ? <label style={{ fontSize: '1.4rem', fontWeight: 600, color: colors.text.primary }}>{label}</label> : null}
      {children}
      {description ? <span style={{ fontSize: '1.2rem', color: colors.text.secondary }}>{description}</span> : null}
      {error ? <span style={{ fontSize: '1.2rem', color: colors.feedback.error }}>{error}</span> : null}
    </div>
  );
}

