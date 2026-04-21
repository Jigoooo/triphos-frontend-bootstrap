import { motion } from 'framer-motion';
import { useColors } from '@/shared/theme';

export function BouncingDotsLoader() {
  const colors = useColors();

  return (
    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 0.8, delay: index * 0.1 }}
          style={{
            width: '0.8rem',
            height: '0.8rem',
            borderRadius: '50%',
            backgroundColor: colors.interactive.primary,
          }}
        />
      ))}
    </div>
  );
}

