import { X } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';

import { useSelectContext } from '../model/select-context';
import type { SelectValueProps } from '../model/types';
import { useColors } from '@/shared/theme';

const COUNTER_RESERVE_LABEL = '+999';
const COUNTER_WIDTH = '4.2rem';
const FALLBACK_GAP_PX = 5;

function formatHiddenCount(count: number) {
  return count > 999 ? COUNTER_RESERVE_LABEL : `+${count}`;
}

function parseGap(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : FALLBACK_GAP_PX;
}

export function SelectValue({ placeholder, style }: SelectValueProps) {
  const colors = useColors();
  const {
    multiple,
    selectedValue,
    selectedValues,
    maxVisibleValues,
    getLabelForValue,
    placeholder: contextPlaceholder,
    toggleValue,
  } = useSelectContext();
  const valueListRef = useRef<HTMLSpanElement>(null);
  const measureListRef = useRef<HTMLSpanElement>(null);
  const [measuredVisibleCount, setMeasuredVisibleCount] = useState(0);
  const labels = selectedValues.map((value) => getLabelForValue(value));
  const labelSignature = labels.join('\u001f');
  const visibleLimit = Math.min(selectedValues.length, maxVisibleValues ?? selectedValues.length);

  useEffect(() => {
    if (!multiple || selectedValues.length === 0) return;

    const valueList = valueListRef.current;
    const measureList = measureListRef.current;
    if (!valueList || !measureList) return;
    let animationFrame = 0;

    const updateVisibleCount = () => {
      const availableWidth = valueList.getBoundingClientRect().width;
      const computedStyle = getComputedStyle(valueList);
      const gap = parseGap(computedStyle.columnGap || computedStyle.gap);
      const chipNodes = Array.from(
        measureList.querySelectorAll<HTMLElement>('[data-select-value-chip-measure]'),
      );
      const counterNode = measureList.querySelector<HTMLElement>('[data-select-value-counter-measure]');
      const counterWidth = counterNode?.getBoundingClientRect().width ?? 0;

      let usedWidth = 0;
      let nextVisibleCount = 0;

      for (let index = 0; index < visibleLimit; index += 1) {
        const chipWidth = chipNodes[index]?.getBoundingClientRect().width ?? 0;
        const nextUsedWidth = usedWidth + (index > 0 ? gap : 0) + chipWidth;
        const reserveCounterWidth = selectedValues.length > index + 1 ? gap + counterWidth : 0;

        if (nextUsedWidth + reserveCounterWidth > availableWidth) {
          break;
        }

        usedWidth = nextUsedWidth;
        nextVisibleCount = index + 1;
      }

      setMeasuredVisibleCount((current) => {
        const stableVisibleCount = Math.max(nextVisibleCount, 1);
        return current === stableVisibleCount ? current : stableVisibleCount;
      });
    };

    animationFrame = requestAnimationFrame(updateVisibleCount);

    if (typeof ResizeObserver === 'undefined') {
      return () => {
        cancelAnimationFrame(animationFrame);
      };
    }

    const resizeObserver = new ResizeObserver(updateVisibleCount);
    resizeObserver.observe(valueList);
    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [labelSignature, multiple, selectedValues.length, visibleLimit]);

  if (multiple) {
    if (selectedValues.length === 0) {
      return (
        <span
          style={{
            color: colors.text.tertiary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            ...style,
          }}
        >
          {placeholder || contextPlaceholder}
        </span>
      );
    }

    const visibleCount = Math.min(Math.max(measuredVisibleCount, 1), visibleLimit);
    const visibleValues = selectedValues.slice(0, visibleCount);
    const hiddenCount = selectedValues.length - visibleValues.length;

    const chipStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      minWidth: 0,
      maxWidth: '100%',
      padding: '0.35rem 0.8rem',
      borderRadius: '999px',
      backgroundColor: colors.interactive.primarySurface,
      border: `1px solid ${colors.interactive.primary}`,
      color: colors.text.primary,
      fontSize: '1.25rem',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    } satisfies CSSProperties;
    const removeIconStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '1.4rem',
      height: '1.4rem',
      borderRadius: '999px',
      color: colors.text.secondary,
      flexShrink: 0,
    } satisfies CSSProperties;
    const counterStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: COUNTER_WIDTH,
      flexShrink: 0,
      color: colors.text.secondary,
      fontSize: '1.25rem',
      fontWeight: 700,
      whiteSpace: 'nowrap',
    } satisfies CSSProperties;

    return (
      <span
        ref={valueListRef}
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'nowrap',
          minWidth: 0,
          width: '100%',
          overflow: 'hidden',
          ...style,
        }}
      >
        {visibleValues.map((value) => (
          <span
            key={String(value)}
            style={{
              ...chipStyle,
              flex: '0 1 auto',
            }}
          >
            <span
              style={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {getLabelForValue(value)}
            </span>
            <span
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                toggleValue(value);
              }}
              style={{
                ...removeIconStyle,
                cursor: 'pointer',
              }}
              aria-label={`${getLabelForValue(value)} remove`}
            >
              <X size={12} />
            </span>
          </span>
        ))}
        {hiddenCount > 0 ? <span style={counterStyle}>{formatHiddenCount(hiddenCount)}</span> : null}
        <span
          ref={measureListRef}
          aria-hidden='true'
          style={{
            position: 'absolute',
            visibility: 'hidden',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'nowrap',
            width: 'max-content',
            height: 0,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {labels.map((label, index) => (
            <span
              key={`${label}-${index}`}
              data-select-value-chip-measure='true'
              style={{
                ...chipStyle,
                flex: '0 0 auto',
              }}
            >
              <span>{label}</span>
              <span style={removeIconStyle}>
                <X size={12} />
              </span>
            </span>
          ))}
          <span data-select-value-counter-measure='true' style={counterStyle}>
            {COUNTER_RESERVE_LABEL}
          </span>
        </span>
      </span>
    );
  }

  return (
    <span
      style={{
        color: selectedValue === undefined ? colors.text.tertiary : colors.text.primary,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: '1.45rem',
        ...style,
      }}
    >
      {selectedValue === undefined ? placeholder || contextPlaceholder : getLabelForValue(selectedValue)}
    </span>
  );
}
