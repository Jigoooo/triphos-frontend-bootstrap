import { CircleAlert, CircleCheckBig, TriangleAlert } from 'lucide-react';
import { Toaster as SonnerToaster } from 'sonner';

import { useColors, useThemeStore } from '@/shared/theme';

export function Toaster() {
  const colors = useColors();
  const resolvedMode = useThemeStore((state) => state.resolvedMode);

  return (
    <SonnerToaster
      theme={resolvedMode}
      position='bottom-right'
      expand
      offset='2rem'
      toastOptions={{
        style: {
          background: colors.bg.elevated,
          color: colors.text.primary,
          border: `1px solid ${colors.border.default}`,
          boxShadow: `0 4px 12px ${colors.shadow.floating}`,
          fontSize: '0.9rem',
        },
        duration: 1200,
      }}
      icons={{
        success: <CircleCheckBig size={18} color={colors.feedback.success} />,
        warning: <TriangleAlert size={18} color={colors.feedback.warning} />,
        error: <CircleAlert size={18} color={colors.feedback.error} />,
      }}
    />
  );
}
