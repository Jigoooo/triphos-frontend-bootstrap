import { colorPrimitives as p } from './color-primitives';

export type SemanticColors = {
  bg: {
    base: string;
    elevated: string;
    subtle: string;
    input: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    onBrand: string;
  };
  border: {
    default: string;
    input: string;
    focus: string;
  };
  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
  };
  feedback: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
};

export const lightColors: SemanticColors = {
  bg: {
    base: '#f8fafc',
    elevated: '#ffffff',
    subtle: '#f3f4f6',
    input: '#f1f5f9',
  },
  text: {
    primary: '#0f172a',
    secondary: '#64748b',
    tertiary: p.neutral[700],
    onBrand: p.neutral[1300],
  },
  border: {
    default: '#e2e8f0',
    input: p.neutral[1000],
    focus: p.brand[600],
  },
  interactive: {
    primary: p.brand[600],
    primaryHover: p.brand[700],
    primaryActive: p.brand[800],
  },
  feedback: {
    success: p.green[500],
    error: p.red[500],
    warning: p.amber[500],
    info: p.blue[500],
  },
};

export const darkColors: SemanticColors = { ...lightColors };

