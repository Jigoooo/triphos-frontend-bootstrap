import { motion } from 'framer-motion';

import { useColors } from '@/shared/theme';

export function Spinner({ size = 18 }: { size?: number }) {
  const colors = useColors();

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${colors.border.default}`,
        borderTopColor: colors.interactive.primary,
      }}
    />
  );
}

