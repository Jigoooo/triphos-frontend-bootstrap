import { motion } from 'framer-motion';

import { useColors } from '@/shared/theme';

export function Spinner({ size = 24 }: { size?: number }) {
  const colors = useColors();
  const strokeWidth = Math.max(3, Math.round(size / 8));

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `${strokeWidth}px solid ${colors.bg.subtle}`,
        borderTopColor: colors.interactive.primary,
        borderRightColor: colors.interactive.primaryHover,
        boxShadow: `0 10px 26px -24px ${colors.shadow.floating}`,
      }}
    />
  );
}
