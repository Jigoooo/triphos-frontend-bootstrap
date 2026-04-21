import { useEffect, useState } from 'react';

import type { OverlayScrollbarProps } from '../model/overlay-scrollbar-types';
import { Z_INDEX } from '@/shared/constants';
import { useColors } from '@/shared/theme';

export function OverlayScrollbar({ containerRef, offset }: OverlayScrollbarProps) {
  const colors = useColors();
  const [metrics, setMetrics] = useState({
    scrollTop: 0,
    scrollHeight: 0,
    clientHeight: 0,
  });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const update = () => {
      setMetrics({
        scrollTop: element.scrollTop,
        scrollHeight: element.scrollHeight,
        clientHeight: element.clientHeight,
      });
    };

    update();
    element.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    return () => {
      element.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [containerRef]);

  const { scrollTop, scrollHeight, clientHeight } = metrics;
  if (scrollHeight <= clientHeight || clientHeight === 0) return null;

  const thumbHeight = Math.max(20, (clientHeight / scrollHeight) * clientHeight);
  const maxScrollTop = scrollHeight - clientHeight;
  const maxThumbTop = clientHeight - thumbHeight;
  const thumbTop = maxScrollTop > 0 ? (scrollTop / maxScrollTop) * maxThumbTop : 0;

  return (
    <div
      style={{
        position: 'sticky',
        top: offset?.top ?? 0,
        float: 'right',
        height: 0,
        overflow: 'visible',
        zIndex: Z_INDEX.SCROLLBAR,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: offset?.right ?? 0,
          width: '0.6rem',
          height: clientHeight,
          borderRadius: '0.4rem',
          backgroundColor: 'transparent',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: thumbTop + 4,
            right: 0,
            width: '0.4rem',
            height: thumbHeight - 8,
            borderRadius: '0.4rem',
            backgroundColor: colors.text.disabled,
          }}
        />
      </div>
    </div>
  );
}

