import type { SemanticColors } from './color-tokens';
import { ResolvedThemeMode, useThemeStore } from './theme-store';

export function useColors(): SemanticColors {
  return useThemeStore((state) => state.colors);
}

export function useIsDarkMode(): boolean {
  return useThemeStore((state) => state.resolvedMode === ResolvedThemeMode.Dark);
}

