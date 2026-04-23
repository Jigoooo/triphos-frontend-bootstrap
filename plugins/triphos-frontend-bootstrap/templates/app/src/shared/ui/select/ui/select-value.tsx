import { X } from 'lucide-react';

import { useSelectContext } from '../model/select-context';
import type { SelectValueProps } from '../model/types';
import { useColors } from '@/shared/theme';

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

    const visibleValues = selectedValues.slice(0, maxVisibleValues);
    const hiddenCount = selectedValues.length - visibleValues.length;

    return (
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          ...style,
        }}
      >
        {visibleValues.map((value) => (
        <span
          key={String(value)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            maxWidth: '100%',
            padding: '0.35rem 0.8rem',
            borderRadius: '999px',
            backgroundColor: colors.interactive.primarySurface,
            border: `1px solid ${colors.interactive.primary}`,
            color: colors.text.primary,
            fontSize: '1.25rem',
            fontWeight: 600,
          }}
        >
          <span
            style={{
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
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1.4rem',
              height: '1.4rem',
              borderRadius: '999px',
              color: colors.text.secondary,
              cursor: 'pointer',
              flexShrink: 0,
            }}
            aria-label={`${getLabelForValue(value)} remove`}
          >
            <X size={12} />
          </span>
          </span>
        ))}
        {hiddenCount > 0 ? (
          <span
            style={{
              color: colors.text.secondary,
              fontSize: '1.25rem',
              fontWeight: 600,
            }}
          >
            +{hiddenCount}
          </span>
        ) : null}
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
