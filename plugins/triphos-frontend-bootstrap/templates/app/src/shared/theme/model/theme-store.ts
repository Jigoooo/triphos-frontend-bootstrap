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

function resolveMode(_mode: ThemeMode): ResolvedThemeMode {
  return ResolvedThemeMode.Light;
}

function resolveColors(resolved: ResolvedThemeMode): SemanticColors {
  return resolved === ResolvedThemeMode.Dark ? darkColors : lightColors;
}

function applyToDocument(resolved: ResolvedThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', resolved);
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
      const initialResolved = resolveMode(ThemeMode.Light);

      return {
        themeMode: ThemeMode.Light,
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
  return () => {};
}

