import { colorPrimitives } from './color-primitives';
import { darkColors, lightColors } from './color-tokens';

export const theme = {
  colors: {
    light: lightColors,
    dark: darkColors,
    primitives: colorPrimitives,
  },
} as const;

