export interface CurrencyFormatOptions {
  locale?: string
  currency?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
}

export function formatCurrency(
  amount: number,
  options: CurrencyFormatOptions = {}
): string {
  const {
    locale = 'en-US',
    currency = 'USD',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount)
  } catch (error) {
    // Fallback for unsupported currencies or locales
    return `${currency} ${amount.toFixed(minimumFractionDigits)}`
  }
}

export function parseCurrency(value: string, locale = 'en-US'): number {
  try {
    // Remove currency symbols and formatting
    const cleanValue = value.replace(/[^\d.,-]/g, '')
    
    // Handle different decimal separators based on locale
    const decimalSeparator = locale.includes(',') ? ',' : '.'
    const thousandsSeparator = locale.includes(',') ? '.' : ','
    
    const normalizedValue = cleanValue
      .replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '')
      .replace(new RegExp(`\\${decimalSeparator}`), '.')
    
    return parseFloat(normalizedValue) || 0
  } catch (error) {
    return 0
  }
}

export function getCurrencySymbol(currency: string, locale = 'en-US'): string {
  try {
    return (0).toLocaleString(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).replace(/[0-9]/g, '').trim()
  } catch (error) {
    return currency
  }
}

// Common currency configurations
export const currencyConfigs = {
  USD: { locale: 'en-US', currency: 'USD' },
  EUR: { locale: 'de-DE', currency: 'EUR' },
  GBP: { locale: 'en-GB', currency: 'GBP' },
  JPY: { locale: 'ja-JP', currency: 'JPY', minimumFractionDigits: 0 },
  CNY: { locale: 'zh-CN', currency: 'CNY' },
  INR: { locale: 'en-IN', currency: 'INR' },
  CAD: { locale: 'en-CA', currency: 'CAD' },
  AUD: { locale: 'en-AU', currency: 'AUD' },
}

export function formatCurrencyByCode(
  amount: number,
  currencyCode: keyof typeof currencyConfigs = 'USD'
): string {
  const config = currencyConfigs[currencyCode] || currencyConfigs.USD
  return formatCurrency(amount, config)
}
