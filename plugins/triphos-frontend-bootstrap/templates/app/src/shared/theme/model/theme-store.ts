import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { darkColors, lightColors, type SemanticColors } from './color-tokens';

export enum ThemeMode {
  Light = 'light',
  Dark = 'dark',
  System = 'system',
}

export enum ResolvedThemeMode {
  Light = 'light',
  Dark = 'dark',
}

function getSystemMode(): ResolvedThemeMode {
  if (typeof window === 'undefined') return ResolvedThemeMode.Light;
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? ResolvedThemeMode.Dark
    : ResolvedThemeMode.Light;
}

function resolveMode(mode: ThemeMode): ResolvedThemeMode {
  if (mode === ThemeMode.System) return getSystemMode();
  return mode === ThemeMode.Dark ? ResolvedThemeMode.Dark : ResolvedThemeMode.Light;
}

function resolveColors(resolved: ResolvedThemeMode): SemanticColors {
  return resolved === ResolvedThemeMode.Dark ? darkColors : lightColors;
}

function applyToDocument(resolved: ResolvedThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.style.colorScheme = resolved;
  document.body.style.backgroundColor =
    resolved === ResolvedThemeMode.Dark ? darkColors.bg.base : lightColors.bg.base;
  document.body.style.color =
    resolved === ResolvedThemeMode.Dark ? darkColors.text.primary : lightColors.text.primary;
}

type ThemeStore = {
  themeMode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  colors: SemanticColors;
  setThemeMode: (mode: ThemeMode) => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => {
      const initialResolved = resolveMode(ThemeMode.System);

      return {
        themeMode: ThemeMode.System,
        resolvedMode: initialResolved,
        colors: resolveColors(initialResolved),
        setThemeMode: (mode: ThemeMode) => {
          const resolved = resolveMode(mode);
          applyToDocument(resolved);
          set({
            themeMode: mode,
            resolvedMode: resolved,
            colors: resolveColors(resolved),
          });
        },
      };
    },
    {
      name: 'theme',
      partialize: (state) => ({ themeMode: state.themeMode }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        const resolved = resolveMode(state.themeMode);
        applyToDocument(resolved);
        state.resolvedMode = resolved;
        state.colors = resolveColors(resolved);
      },
    },
  ),
);

export function initSystemThemeListener(): () => void {
  if (typeof window === 'undefined') return () => {};

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = () => {
    const state = useThemeStore.getState();
    if (state.themeMode !== ThemeMode.System) return;

    const resolved = resolveMode(ThemeMode.System);
    applyToDocument(resolved);
    useThemeStore.setState({
      resolvedMode: resolved,
      colors: resolveColors(resolved),
    });
  };

  handleChange();
  media.addEventListener('change', handleChange);

  return () => {
    media.removeEventListener('change', handleChange);
  };
}
