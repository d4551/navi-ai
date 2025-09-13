// Shared date/time formatting utilities
// Centralizes common date formatting patterns used across the app.

export type DateInput = Date | string | number | undefined | null;

function toDate(input: DateInput): Date | null {
  if (input === undefined || input === null) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

export function formatDateBasic(
  input: DateInput,
  locale: string = "en-US",
): string {
  const d = toDate(input);
  return d ? d.toLocaleDateString(locale) : "Unknown";
}

export function formatDateLong(
  input: DateInput,
  locale: string = "en-US",
): string {
  const d = toDate(input);
  return d
    ? d.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";
}

export function formatDateShort(
  input: DateInput,
  locale: string = "en-US",
): string {
  const d = toDate(input);
  return d
    ? d.toLocaleDateString(locale, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown";
}

export function formatDateTime(
  input: DateInput,
  locale: string = "en-US",
): string {
  const d = toDate(input);
  if (!d) return "Unknown";
  const date = d.toLocaleDateString(locale);
  const time = d.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} ${time}`;
}

export function formatMonthYear(
  input: DateInput,
  locale: string = "en-US",
): string {
  const d = toDate(input);
  return d
    ? d.toLocaleDateString(locale, { year: "numeric", month: "short" })
    : "Unknown";
}

export function formatRelativeDate(
  input: DateInput,
  locale: string = "en-US",
): string {
  const d = toDate(input);
  if (!d) return "Unknown";
  const now = new Date();
  const diffMs = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return d.toLocaleDateString(locale);
}

export function formatDateRange(
  startDate?: string,
  endDate?: string,
  current?: boolean,
): string {
  if (current) {
    return `${startDate || "Start"} - Present`;
  }
  return `${startDate || "Start"} - ${endDate || "End"}`;
}
