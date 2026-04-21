import { motion } from 'framer-motion';
import { useColors } from '@/shared/theme';

export function Skeleton({
  width = '100%',
  height = '1.6rem',
  borderRadius = '0.8rem',
}: {
  width?: number | string;
  height?: number | string;
  borderRadius?: number | string;
}) {
  const colors = useColors();

  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: colors.bg.subtle,
      }}
    />
  );
}

