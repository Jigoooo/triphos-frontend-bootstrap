import { colorPrimitives as p } from './color-primitives';

export type SemanticColors = {
  bg: {
    base: string;
    elevated: string;
    subtle: string;
    input: string;
    overlay: string;
    overlayHover: string;
    inverse: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    onBrand: string;
    inverse: string;
    disabled: string;
  };
  border: {
    default: string;
    input: string;
    focus: string;
    inverse: string;
  };
  interactive: {
    primary: string;
    primaryHover: string;
    primaryActive: string;
    primarySurface: string;
  };
  feedback: {
    success: string;
    error: string;
    warning: string;
    info: string;
  };
  overlay: {
    modalBackdrop: string;
    sheetBackdrop: string;
  };
  shadow: {
    floating: string;
    modal: string;
  };
};

export const lightColors: SemanticColors = {
  bg: {
    base: '#f8fafc',
    elevated: '#ffffff',
    subtle: '#f3f4f6',
    input: '#f1f5f9',
    overlay: p.blackAlpha[5],
    overlayHover: p.blackAlpha[10],
    inverse: p.neutral[150],
  },
  text: {
    primary: '#0f172a',
    secondary: '#64748b',
    tertiary: '#4b5563',
    onBrand: p.neutral[1300],
    inverse: p.neutral[1200],
    disabled: p.neutral[800],
  },
  border: {
    default: '#e2e8f0',
    input: p.neutral[1000],
    focus: p.brand[600],
    inverse: p.whiteAlpha[10],
  },
  interactive: {
    primary: p.brand[700],
    primaryHover: p.brand[800],
    primaryActive: p.brand[800],
    primarySurface: p.brand[50],
  },
  feedback: {
    success: p.green[500],
    error: p.red[500],
    warning: p.amber[500],
    info: p.blue[500],
  },
  overlay: {
    modalBackdrop: 'rgba(15, 23, 42, 0.32)',
    sheetBackdrop: 'rgba(15, 23, 42, 0.24)',
  },
  shadow: {
    floating: 'rgba(15, 23, 42, 0.18)',
    modal: 'rgba(15, 23, 42, 0.18)',
  },
};

export const darkColors: SemanticColors = {
  ...lightColors,
  bg: {
    ...lightColors.bg,
    base: '#0a0a0a',
    elevated: '#111111',
    subtle: '#1a1a1a',
    input: '#111111',
    overlay: p.whiteAlpha[5],
    overlayHover: p.whiteAlpha[10],
    inverse: '#f8fafc',
  },
  text: {
    ...lightColors.text,
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
    inverse: '#0f172a',
    disabled: '#64748b',
  },
  border: {
    ...lightColors.border,
    default: 'rgba(255,255,255,0.12)',
    input: 'rgba(255,255,255,0.16)',
    inverse: 'rgba(15,23,42,0.12)',
  },
  interactive: {
    ...lightColors.interactive,
    primarySurface: 'rgba(5, 150, 105, 0.22)',
  },
  overlay: {
    modalBackdrop: 'rgba(0, 0, 0, 0.62)',
    sheetBackdrop: 'rgba(0, 0, 0, 0.44)',
  },
  shadow: {
    floating: 'rgba(0, 0, 0, 0.42)',
    modal: 'rgba(0, 0, 0, 0.42)',
  },
};
