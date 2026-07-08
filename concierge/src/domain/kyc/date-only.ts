/**
 * Calendar-date arithmetic without Date's timezone traps: an ISO date string
 * parsed via `new Date()` lands at UTC midnight, so reading it back with
 * local getters shifts it a day west of UTC — enough to pass a 17-year-old.
 */
export interface DateParts {
  year: number;
  month: number;
  day: number;
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

export function parseDateOnly(value: string): DateParts | null {
  const match = ISO_DATE_PATTERN.exec(value.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  return { year, month, day };
}

/** The calendar date where the customer is, from the injected clock. */
export function localDateParts(date: Date): DateParts {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
}

export function compareDateParts(a: DateParts, b: DateParts): number {
  return toOrdinal(a) - toOrdinal(b);
}

export function yearsBetween(from: DateParts, to: DateParts): number {
  const years = to.year - from.year;
  const hadAnniversary =
    to.month > from.month || (to.month === from.month && to.day >= from.day);
  return hadAnniversary ? years : years - 1;
}

function toOrdinal(parts: DateParts): number {
  return parts.year * 10000 + parts.month * 100 + parts.day;
}
