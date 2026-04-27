import { format, parse, setHours, setMinutes } from 'date-fns';

export function formatPhoneNumber(phoneNumber: string | number) {
  if (!phoneNumber) return '';

  const cleaned = `${phoneNumber}`.replace(/\D/g, '');
  let match: RegExpExecArray | null = null;

  if (cleaned.length === 11) {
    match = /^(\d{3})(\d{4})(\d{4})$/.exec(cleaned);
  } else if (cleaned.length === 10) {
    match = /^(\d{3})(\d{3})(\d{4})$/.exec(cleaned);
  }

  return match ? `${match[1]}-${match[2]}-${match[3]}` : `${phoneNumber}`;
}

export function thousandSeparator(
  number?: string | number,
  options: {
    allowNegative?: boolean;
    allowDecimal?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {},
) {
  const {
    allowNegative = false,
    allowDecimal = true,
    minimumFractionDigits,
    maximumFractionDigits,
  } = options;

  if (!number && number !== 0) return '0';

  const stringValue = number.toString().replaceAll(',', '');
  const cleanedValue = allowDecimal ? stringValue : stringValue.replace(/\./g, '');
  const endsWithDot = allowDecimal && cleanedValue.endsWith('.');
  const decimalMatch = allowDecimal ? cleanedValue.match(/\.(\d*)$/) : null;
  const trailingDecimal = decimalMatch?.[1] ?? '';
  const numericValue = Number(cleanedValue);

  if (Number.isNaN(numericValue)) return '';
  if (!allowNegative && numericValue < 0) return '0';

  if (endsWithDot) {
    return numericValue.toLocaleString('ko-KR') + '.';
  }

  if (trailingDecimal !== '') {
    const maxFraction = maximumFractionDigits ?? trailingDecimal.length;
    const minFraction = Math.min(minimumFractionDigits ?? trailingDecimal.length, maxFraction);
    return numericValue.toLocaleString('ko-KR', {
      minimumFractionDigits: minFraction,
      maximumFractionDigits: maxFraction,
    });
  }

  return numericValue.toLocaleString('ko-KR', {
    minimumFractionDigits,
    maximumFractionDigits,
  });
}

export function formatDateString(date: string | number, formatter = '.') {
  if (!date || !formatter) return '';

  const cleaned = `${date}`.replace(/\D/g, '');

  if (cleaned.length === 8) {
    return cleaned.replace(/(\d{4})(\d{2})(\d{2})/, `$1${formatter}$2${formatter}$3`);
  }

  if (cleaned.length === 6) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})/, `$1${formatter}$2${formatter}$3`);
  }

  return `${date}`;
}

export function convertToSpecificTime(date: string | number, targetHour: number, targetMinute: number) {
  const parsed = parse(`${date}`, 'yyyyMMddHHmm', new Date());
  const withHour = setHours(parsed, targetHour);
  const finalDate = setMinutes(withHour, targetMinute);
  return format(finalDate, 'yyyyMMddHHmm');
}

export function applyMiddleEllipsis(text: string, maxLength: number, frontLength: number, backLength: number) {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, frontLength)}...${text.substring(text.length - backLength)}`;
}

export function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
