import { motion } from 'framer-motion';

import { useColors } from '@/shared/theme';

export function BouncingDotsLoader() {
  const colors = useColors();

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          animate={{ y: [0, -6, 0], scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 0.55, delay: index * 0.08 }}
          style={{
            width: '1rem',
            height: '1rem',
            borderRadius: '50%',
            backgroundColor: colors.interactive.primary,
          }}
        />
      ))}
    </div>
  );
}
