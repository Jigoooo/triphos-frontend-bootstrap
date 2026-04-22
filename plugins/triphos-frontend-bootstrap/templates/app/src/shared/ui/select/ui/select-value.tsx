import { useSelectContext } from '../model/select-context';
import type { SelectValueProps } from '../model/types';
import { useColors } from '@/shared/theme';

export function SelectValue({ placeholder, style }: SelectValueProps) {
  const colors = useColors();
  const { multiple, selectedValue, selectedValues, maxVisibleValues, getLabelForValue, placeholder: contextPlaceholder } =
    useSelectContext();

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
              maxWidth: '100%',
              padding: '0.25rem 0.7rem',
              borderRadius: '999px',
              backgroundColor: colors.interactive.primarySurface,
              color: colors.interactive.primary,
              fontSize: '1.25rem',
              fontWeight: 600,
            }}
          >
            {getLabelForValue(value)}
          </span>
        ))}
        {hiddenCount > 0 ? (
          <span
            style={{
              color: colors.text.secondary,
              fontSize: '1.25rem',
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
        ...style,
      }}
    >
      {selectedValue === undefined ? placeholder || contextPlaceholder : getLabelForValue(selectedValue)}
    </span>
  );
}
