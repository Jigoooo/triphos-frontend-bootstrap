import type { TypographyProps } from '../model/typography-type';

export function Typography({ ref, style, children, ...props }: TypographyProps) {
  return (
    <span
      ref={ref}
      style={{
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
