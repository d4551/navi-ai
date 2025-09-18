/**
 * Date utility functions
 */

/**
 * Returns a human-readable time difference string
 * @param date - The date to compare against now
 * @returns A string like "5 minutes", "2 hours", "3 days", etc.
 */
export function timeSince(date: Date | string): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()

  // If negative, return "just now"
  if (diffMs < 0) {
    return 'just now'
  }

  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffYears > 0) {
    return `${diffYears} year${diffYears !== 1 ? 's' : ''}`
  } else if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`
  } else if (diffWeeks > 0) {
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''}`
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`
  } else if (diffSeconds > 0) {
    return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''}`
  } else {
    return 'just now'
  }
}

/**
 * Formats a date to a readable string
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = new Date(date)
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }

  return dateObj.toLocaleDateString(undefined, defaultOptions)
}

/**
 * Formats a date and time to a readable string
 * @param date - The date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted datetime string
 */
export function formatDateTime(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = new Date(date)
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  }

  return dateObj.toLocaleString(undefined, defaultOptions)
}

/**
 * Checks if a date is today
 * @param date - The date to check
 * @returns True if the date is today
 */
export function isToday(date: Date | string): boolean {
  const today = new Date()
  const checkDate = new Date(date)

  return today.toDateString() === checkDate.toDateString()
}

/**
 * Checks if a date is yesterday
 * @param date - The date to check
 * @returns True if the date is yesterday
 */
export function isYesterday(date: Date | string): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const checkDate = new Date(date)

  return yesterday.toDateString() === checkDate.toDateString()
}
