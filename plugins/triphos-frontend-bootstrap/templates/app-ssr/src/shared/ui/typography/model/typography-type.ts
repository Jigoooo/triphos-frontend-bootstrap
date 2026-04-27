import type { HTMLAttributes, ReactNode, Ref } from 'react';

export type TypographyProps = HTMLAttributes<HTMLSpanElement> & {
  ref?: Ref<HTMLSpanElement>;
  children?: ReactNode;
};
