import { motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';

import { ResolvedThemeMode, ThemeMode, useColors, useThemeStore } from '@/shared/theme';
import { RawButton } from '@/shared/ui/button';

export function ThemeToggle() {
  const colors = useColors();
  const resolvedMode = useThemeStore((state) => state.resolvedMode);
  const setThemeMode = useThemeStore((state) => state.setThemeMode);
  const isDark = resolvedMode === ResolvedThemeMode.Dark;

  return (
    <RawButton
      onClick={() => setThemeMode(isDark ? ThemeMode.Light : ThemeMode.Dark)}
      style={{
        userSelect: 'none',
        position: 'relative',
        width: '5.6rem',
        height: '2.8rem',
        borderRadius: '9999px',
        border: `1px solid ${colors.border.default}`,
        cursor: 'pointer',
        background: isDark
          ? `linear-gradient(135deg, ${colors.bg.subtle}, ${colors.bg.overlayHover})`
          : `linear-gradient(135deg, ${colors.interactive.primarySurface}, ${colors.bg.subtle})`,
        padding: 0,
        display: 'flex',
        alignItems: 'center',
        boxShadow: `0 1px 10px -6px ${colors.shadow.floating}`,
        transition: 'background-color 0.3s ease, border-color 0.3s ease',
      }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          width: '2.2rem',
          height: '2.2rem',
          borderRadius: '50%',
          backgroundColor: isDark ? colors.bg.inverse : colors.bg.base,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: isDark ? '0.3rem' : '3.1rem',
          border: `1px solid ${isDark ? colors.border.inverse : colors.border.default}`,
          boxShadow: `0 8px 18px -12px ${colors.shadow.floating}`,
        }}
      >
        <motion.div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          key={resolvedMode}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {isDark ? (
            <Moon size={12} color={colors.text.inverse} fill={colors.text.inverse} />
          ) : (
            <Sun size={12} color={colors.feedback.warning} />
          )}
        </motion.div>
      </motion.div>
    </RawButton>
  );
}

