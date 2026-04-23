import { Link } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { Sparkles, Workflow } from 'lucide-react';

import { useMediaQuery, usePreferReducedMotion } from '@/shared/hooks';
import { ResolvedThemeMode, useColors, useThemeStore } from '@/shared/theme';
import { ThemeToggle } from '@/shared/ui/theme-toggle';
import { toast } from '@/shared/ui/toast';

export function HomePage() {
  const colors = useColors();
  const resolvedMode = useThemeStore((state) => state.resolvedMode);
  const prefersReducedMotion = usePreferReducedMotion();
  const isWide = useMediaQuery('(min-width: 768px)');
  const themeLabel = resolvedMode === ResolvedThemeMode.Dark ? 'Dark' : 'Light';

  return (
    <main
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        width: '100%',
        padding: isWide ? '2rem' : '1.2rem',
        backgroundColor: colors.bg.base,
      }}
    >
      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
        {...(!prefersReducedMotion
          ? {
              animate: { opacity: 1, y: 0 },
              transition: { duration: 0.4, ease: 'easeOut' as const },
            }
          : {})}
        style={{
          width: isWide ? '100%' : 'calc(100vw - 4.8rem)',
          maxWidth: '72rem',
          minWidth: 0,
          border: `1px solid ${colors.border.default}`,
          borderRadius: isWide ? '2.8rem' : '2rem',
          background: colors.bg.elevated,
          boxShadow: '0 24px 80px rgba(15, 23, 42, 0.12)',
          padding: isWide ? '2rem' : '1.35rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: isWide ? 'center' : 'flex-start',
            flexDirection: isWide ? 'row' : 'column',
            gap: '0.5rem',
            color: colors.interactive.primary,
            fontSize: isWide ? '1.6rem' : '1.7rem',
            marginBottom: '1rem',
          }}
        >
          <Sparkles size={18} />
          Triphos frontend bootstrap
        </div>
        <h1
          style={{
            fontSize: 'clamp(2.8rem, 5vw, 4.8rem)',
            lineHeight: 1.05,
            marginBottom: '1rem',
            color: colors.text.primary,
            overflowWrap: 'anywhere',
          }}
        >
          React 19 + Compiler + FSD starter
        </h1>
        <p
          style={{
            color: colors.text.secondary,
            lineHeight: 1.7,
            fontSize: isWide ? '1.7rem' : '1.6rem',
            marginBottom: '1.5rem',
            overflowWrap: 'anywhere',
          }}
        >
          This starter mirrors the Triphos baseline stack and leaves room for
          `triphos-fsd-refactor`, `triphos-react-lint-rules`, and
          `triphos-api-client-setup`.
        </p>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            flexDirection: isWide ? 'row' : 'column',
          }}
        >
          <div
            style={{
              flex: isWide ? '1 1 18rem' : '1 1 100%',
              minWidth: 0,
              border: `1px solid ${colors.border.default}`,
              borderRadius: '2rem',
              padding: '1rem',
              backgroundColor: colors.bg.subtle,
            }}
          >
            <span
              style={{
                color: colors.text.tertiary,
                display: 'block',
                fontSize: '1.4rem',
                marginBottom: '0.35rem',
              }}
            >
              Theme mode
            </span>
            <strong
              style={{
                fontSize: isWide ? '2.1rem' : '2.2rem',
                color: colors.text.primary,
                overflowWrap: 'anywhere',
              }}
            >
              {themeLabel}
            </strong>
          </div>
          <div
            style={{
              flex: isWide ? '1 1 18rem' : '1 1 100%',
              minWidth: 0,
              border: `1px solid ${colors.border.default}`,
              borderRadius: '2rem',
              padding: '1rem',
              backgroundColor: colors.bg.subtle,
            }}
          >
            <span
              style={{
                color: colors.text.tertiary,
                display: 'block',
                fontSize: '1.4rem',
                marginBottom: '0.35rem',
              }}
            >
              Starter scope
            </span>
            <strong
              style={{
                fontSize: isWide ? '2rem' : '2rem',
                lineHeight: 1.25,
                color: colors.text.primary,
                overflowWrap: 'anywhere',
              }}
            >
              Form / Feedback / Loading
            </strong>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            flexDirection: isWide ? 'row' : 'column',
            alignItems: isWide ? 'center' : 'stretch',
          }}
        >
          <ThemeToggle />
          <button
            type='button'
            style={{
              border: 0,
              borderRadius: '999px',
              background: colors.interactive.primary,
              color: colors.text.onBrand,
              cursor: 'pointer',
              font: 'inherit',
              fontSize: '1.6rem',
              fontWeight: 700,
              padding: '0.85rem 1.25rem',
              width: isWide ? 'auto' : '100%',
            }}
            onClick={() => {
              toast.success('Triphos starter is wired up.');
            }}
          >
            Smoke test toast
          </button>
          <Link
            to='/starter'
            style={{
              borderRadius: '999px',
              background: colors.bg.subtle,
              color: colors.text.primary,
              cursor: 'pointer',
              font: 'inherit',
              fontSize: '1.5rem',
              fontWeight: 700,
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              textDecoration: 'none',
              justifyContent: 'center',
              width: isWide ? 'auto' : '100%',
            }}
          >
            <Workflow size={16} />
            Starter route
          </Link>
        </div>
      </motion.section>
    </main>
  );
}
