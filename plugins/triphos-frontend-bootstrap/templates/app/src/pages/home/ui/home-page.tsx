import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Sparkles, Workflow } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { create } from 'zustand';

import { usePreferReducedMotion } from '@/shared/hooks';
import { useColors } from '@/shared/theme';
import { toast } from '@/shared/ui/toast';

type UiState = {
  launches: number;
  increment: () => void;
};

const useUiStore = create<UiState>((set) => ({
  launches: 1,
  increment: () => set((state) => ({ launches: state.launches + 1 })),
}));

export function homePage() {
  const launches = useUiStore((state) => state.launches);
  const increment = useUiStore((state) => state.increment);
  const colors = useColors();
  const prefersReducedMotion = usePreferReducedMotion();
  const isWide = useMediaQuery('(min-width: 768px)');

  return (
    <main
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100dvh',
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
          width: 'min(72rem, 100%)',
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
            fontSize: '1.5rem',
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
          }}
        >
          React 19 + Compiler + FSD starter
        </h1>
        <p
          style={{
            color: colors.text.secondary,
            lineHeight: 1.7,
            fontSize: isWide ? '1.6rem' : '1.45rem',
            marginBottom: '1.5rem',
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
                fontSize: '1.2rem',
                marginBottom: '0.35rem',
              }}
            >
              Today
            </span>
            <strong
              style={{
                fontSize: '2rem',
                color: colors.text.primary,
              }}
            >
              {format(new Date(), 'yyyy-MM-dd')}
            </strong>
          </div>
          <div
            style={{
              flex: isWide ? '1 1 18rem' : '1 1 100%',
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
                fontSize: '1.2rem',
                marginBottom: '0.35rem',
              }}
            >
              Launches
            </span>
            <strong
              style={{
                fontSize: '2rem',
                color: colors.text.primary,
              }}
            >
              {launches}
            </strong>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            flexWrap: 'wrap',
            flexDirection: isWide ? 'row' : 'column',
          }}
        >
          <button
            type='button'
            style={{
              border: 0,
              borderRadius: '999px',
              background: colors.interactive.primary,
              color: colors.text.onBrand,
              cursor: 'pointer',
              font: 'inherit',
              fontWeight: 700,
              padding: '0.85rem 1.25rem',
              width: isWide ? 'auto' : '100%',
            }}
            onClick={() => {
              increment();
              toast.success('Triphos starter is wired up.');
            }}
          >
            Increment
          </button>
          <Link
            to='/starter'
            style={{
              borderRadius: '999px',
              background: colors.bg.subtle,
              color: colors.text.primary,
              cursor: 'pointer',
              font: 'inherit',
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
