import { type RefObject, useEffect, useEffectEvent, useState } from 'react';

export function useScrollbarInteraction(
  containerRef: RefObject<HTMLDivElement | null>,
  thumbSize: number,
  scrollPos: number,
  autoHideDelay: number,
  orientation: 'vertical' | 'horizontal' = 'vertical',
  isPointerOver = false,
) {
  const [isDragging, setIsDragging] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const showScrollbar = useEffectEvent(() => {
    if (!isVisible) {
      setIsVisible(true);
    }
  });

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const show = () => showScrollbar();

    element.addEventListener('wheel', show, { passive: true });
    element.addEventListener('touchstart', show, { passive: true });

    return () => {
      element.removeEventListener('wheel', show);
      element.removeEventListener('touchstart', show);
    };
  }, [containerRef]);

  useEffect(() => {
    if (!isVisible || isDragging || isPointerOver) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, autoHideDelay);

    return () => clearTimeout(timer);
  }, [scrollPos, isVisible, isDragging, autoHideDelay, isPointerOver]);

  const handleThumbPointerDown = (event: React.PointerEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const element = containerRef.current;
    if (!element) return;

    setIsDragging(true);
    (event.target as HTMLElement).setPointerCapture(event.pointerId);

    if (orientation === 'horizontal') {
      const startX = event.clientX;
      const initialScrollLeft = element.scrollLeft;
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      const maxThumbLeft = element.clientWidth - thumbSize;

      const onPointerMove = (pointerEvent: PointerEvent) => {
        const deltaX = pointerEvent.clientX - startX;
        const scrollRatio = maxThumbLeft > 0 ? maxScrollLeft / maxThumbLeft : 0;
        const nextScrollLeft = initialScrollLeft + deltaX * scrollRatio;
        element.scrollTo({
          left: Math.max(0, Math.min(nextScrollLeft, maxScrollLeft)),
        });
      };

      const onPointerUp = (pointerEvent: PointerEvent) => {
        setIsDragging(false);
        (pointerEvent.target as HTMLElement).releasePointerCapture(pointerEvent.pointerId);
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
      };

      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      return;
    }

    const startY = event.clientY;
    const initialScrollTop = element.scrollTop;
    const maxScrollTop = element.scrollHeight - element.clientHeight;
    const maxThumbTop = element.clientHeight - thumbSize;

      const onPointerMove = (pointerEvent: PointerEvent) => {
        const deltaY = pointerEvent.clientY - startY;
        const scrollRatio = maxThumbTop > 0 ? maxScrollTop / maxThumbTop : 0;
        const nextScrollTop = initialScrollTop + deltaY * scrollRatio;
        element.scrollTo({
          top: Math.max(0, Math.min(nextScrollTop, maxScrollTop)),
        });
      };

    const onPointerUp = (pointerEvent: PointerEvent) => {
      setIsDragging(false);
      (pointerEvent.target as HTMLElement).releasePointerCapture(pointerEvent.pointerId);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
    };

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
  };

  const handleTrackPointerDown = (event: React.PointerEvent) => {
    const element = containerRef.current;
    if (!element) return;

    const rect = event.currentTarget.getBoundingClientRect();

    if (orientation === 'horizontal') {
      const clickX = event.clientX - rect.left;
      const clickRatio = clickX / rect.width;
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      element.scrollTo({
        left: clickRatio * maxScrollLeft,
      });
      return;
    }

    const clickY = event.clientY - rect.top;
    const clickRatio = clickY / rect.height;
    const maxScrollTop = element.scrollHeight - element.clientHeight;
    element.scrollTo({
      top: clickRatio * maxScrollTop,
    });
  };

  return {
    isDragging,
    isVisible: isVisible || isDragging,
    handleThumbPointerDown,
    handleTrackPointerDown,
  };
}
