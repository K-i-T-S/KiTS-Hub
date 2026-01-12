export interface DateFormatOptions {
  locale?: string
  dateStyle?: 'full' | 'long' | 'medium' | 'short'
  timeStyle?: 'full' | 'long' | 'medium' | 'short'
  timeZone?: string
}

export function formatDate(
  date: Date | string | number,
  options: DateFormatOptions = {}
): string {
  const {
    locale = 'en-US', // Note: locale parameter available for future i18n implementation
    dateStyle = 'medium',
    timeStyle,
    timeZone,
  } = options

  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date'
    }

    return new Intl.DateTimeFormat(locale, {
      dateStyle,
      timeStyle,
      timeZone,
    }).format(dateObj)
  } catch (error) {
    return 'Invalid Date'
  }
}

export function formatRelativeTime(
  date: Date | string | number,
  _locale: string = 'en-US'
): string {
  // Note: locale parameter available for future i18n implementation
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date

    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date'
    }

    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return 'just now'
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    }

    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
    }

    const diffInMonths = Math.floor(diffInDays / 30)
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
    }

    const diffInYears = Math.floor(diffInDays / 365)
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`
  } catch (error) {
    return 'Invalid Date'
  }
}

export function formatDateTime(
  date: Date | string | number,
  options: DateFormatOptions = {}
): string {
  return formatDate(date, {
    ...options,
    timeStyle: options.timeStyle || 'short',
  })
}

export function formatDateShort(
  date: Date | string | number,
  locale = 'en-US'
): string {
  return formatDate(date, {
    locale,
    dateStyle: 'short',
  })
}

export function isDateValid(date: Date | string | number): boolean {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' 
      ? new Date(date) 
      : date
    return !isNaN(dateObj.getTime())
  } catch {
    return false
  }
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export function addYears(date: Date, years: number): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

export function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

export function endOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

export function isToday(date: Date): boolean {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

export function isYesterday(date: Date): boolean {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toDateString() === yesterday.toDateString()
}

export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return date.toDateString() === tomorrow.toDateString()
}
