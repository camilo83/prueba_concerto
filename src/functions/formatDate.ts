import {
  format,
  parseISO,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
} from 'date-fns';

export function formatDate(dateString: string) {
  const date = parseISO(dateString);
  const now = new Date();

  if (format(now, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')) {
    return format(date, 'HH:mm');
  }

  if (format(now, 'yyyy') === format(date, 'yyyy')) {
    return format(date, 'MMM dd');
  }

  return format(date, 'yyyy-MM-dd');
}

export function formatRelativeDate(dateString: string) {
  const date = parseISO(dateString);
  const daysDifference = differenceInDays(new Date(), date);
  const monthsDifference = differenceInMonths(new Date(), date);
  const yearsDifference = differenceInYears(new Date(), date);

  if (daysDifference < 30) {
    return `hace ${daysDifference} día${daysDifference === 1 ? '' : 's'}`;
  } else if (monthsDifference < 12) {
    return `hace ${monthsDifference} mes${monthsDifference === 1 ? '' : 'es'}`;
  } else {
    return `hace ${yearsDifference} año${yearsDifference === 1 ? '' : 's'}`;
  }
}
