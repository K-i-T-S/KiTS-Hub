import { describe, it, expect } from 'vitest'
import { formatCurrency, parseCurrency, calculateTax, applyDiscount } from '@/lib/utils/currency'

describe('Currency Utils', () => {
  describe('formatCurrency', () => {
    it('should format USD currency correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56')
      expect(formatCurrency(0, 'USD')).toBe('$0.00')
      expect(formatCurrency(-123.45, 'USD')).toBe('-$123.45')
    })

    it('should format EUR currency correctly', () => {
      expect(formatCurrency(1234.56, 'EUR')).toBe('€1,234.56')
      expect(formatCurrency(0, 'EUR')).toBe('€0.00')
    })

    it('should format GBP currency correctly', () => {
      expect(formatCurrency(1234.56, 'GBP')).toBe('£1,234.56')
    })

    it('should format JPY currency correctly (no decimal)', () => {
      expect(formatCurrency(1234, 'JPY')).toBe('¥1,234')
      expect(formatCurrency(1234.56, 'JPY')).toBe('¥1,235') // Rounded
    })

    it('should handle custom currency codes', () => {
      expect(formatCurrency(1234.56, 'CAD')).toBe('CA$1,234.56')
      expect(formatCurrency(1234.56, 'AUD')).toBe('A$1,234.56')
    })

    it('should handle large numbers', () => {
      expect(formatCurrency(1234567890.99, 'USD')).toBe('$1,234,567,890.99')
    })

    it('should handle decimal precision', () => {
      expect(formatCurrency(1234.567, 'USD')).toBe('$1,234.57') // Rounded to 2 decimal places
      expect(formatCurrency(1234.564, 'USD')).toBe('$1,234.56') // Rounded down
    })

    it('should use default currency when none specified', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })
  })

  describe('parseCurrency', () => {
    it('should parse USD currency string to number', () => {
      expect(parseCurrency('$1,234.56')).toBe(1234.56)
      expect(parseCurrency('$0.00')).toBe(0)
      expect(parseCurrency('-$123.45')).toBe(-123.45)
    })

    it('should parse EUR currency string to number', () => {
      expect(parseCurrency('€1,234.56')).toBe(1234.56)
      expect(parseCurrency('€0.00')).toBe(0)
    })

    it('should parse currency without symbol', () => {
      expect(parseCurrency('1,234.56')).toBe(1234.56)
      expect(parseCurrency('1234.56')).toBe(1234.56)
    })

    it('should handle invalid inputs', () => {
      expect(parseCurrency('invalid')).toBe(0)
      expect(parseCurrency('')).toBe(0)
      expect(parseCurrency(null as any)).toBe(0)
      expect(parseCurrency(undefined as any)).toBe(0)
    })

    it('should handle partial currency strings', () => {
      expect(parseCurrency('$1,234')).toBe(1234)
      expect(parseCurrency('1234')).toBe(1234)
    })
  })

  describe('calculateTax', () => {
    it('should calculate tax correctly for different rates', () => {
      expect(calculateTax(100, 0.1)).toBe(10)
      expect(calculateTax(100, 0.15)).toBe(15)
      expect(calculateTax(100, 0.2)).toBe(20)
    })

    it('should handle decimal tax rates', () => {
      expect(calculateTax(100, 0.085)).toBe(8.5)
      expect(calculateTax(1234.56, 0.0875)).toBe(108.024)
    })

    it('should handle zero tax rate', () => {
      expect(calculateTax(100, 0)).toBe(0)
    })

    it('should handle zero amount', () => {
      expect(calculateTax(0, 0.1)).toBe(0)
    })

    it('should handle negative amounts', () => {
      expect(calculateTax(-100, 0.1)).toBe(-10)
    })

    it('should round tax to 2 decimal places', () => {
      expect(calculateTax(100, 0.0833)).toBe(8.33)
      expect(calculateTax(123.456, 0.0875)).toBe(10.80)
    })

    it('should handle percentage input', () => {
      expect(calculateTax(100, 10)).toBe(10) // 10% as number
      expect(calculateTax(100, '10%')).toBe(10) // 10% as string
    })
  })

  describe('applyDiscount', () => {
    it('should apply percentage discount correctly', () => {
      expect(applyDiscount(100, 10)).toBe(90)
      expect(applyDiscount(100, 25)).toBe(75)
      expect(applyDiscount(100, 50)).toBe(50)
    })

    it('should apply fixed amount discount correctly', () => {
      expect(applyDiscount(100, 10, 'fixed')).toBe(90)
      expect(applyDiscount(100, 25, 'fixed')).toBe(75)
    })

    it('should handle decimal discounts', () => {
      expect(applyDiscount(100, 12.5)).toBe(87.5)
      expect(applyDiscount(123.45, 15.75)).toBe(104.02) // Rounded
    })

    it('should handle zero discount', () => {
      expect(applyDiscount(100, 0)).toBe(100)
      expect(applyDiscount(100, 0, 'fixed')).toBe(100)
    })

    it('should handle 100% discount', () => {
      expect(applyDiscount(100, 100)).toBe(0)
    })

    it('should handle discount greater than amount', () => {
      expect(applyDiscount(100, 150, 'fixed')).toBe(0) // Fixed discount caps at 0
      expect(applyDiscount(100, 110)).toBe(0) // Percentage discount caps at 0
    })

    it('should handle negative amounts', () => {
      expect(applyDiscount(-100, 10)).toBe(-110)
      expect(applyDiscount(-100, 10, 'fixed')).toBe(-110)
    })

    it('should round to 2 decimal places', () => {
      expect(applyDiscount(100, 12.345)).toBe(87.66)
      expect(applyDiscount(123.456, 15.789)).toBe(104.00)
    })

    it('should handle percentage string input', () => {
      expect(applyDiscount(100, '10%')).toBe(90)
      expect(applyDiscount(100, '25%')).toBe(75)
    })

    it('should handle invalid discount type', () => {
      expect(applyDiscount(100, 10, 'invalid' as any)).toBe(90) // Defaults to percentage
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large numbers', () => {
      expect(formatCurrency(999999999999.99, 'USD')).toBe('$999,999,999,999.99')
      expect(calculateTax(999999999999, 0.1)).toBe(99999999999.9)
    })

    it('should handle very small numbers', () => {
      expect(formatCurrency(0.01, 'USD')).toBe('$0.01')
      expect(calculateTax(0.01, 0.1)).toBe(0) // Rounded to 0
    })

    it('should handle NaN and Infinity', () => {
      expect(formatCurrency(NaN, 'USD')).toBe('$0.00')
      expect(formatCurrency(Infinity, 'USD')).toBe('$Infinity')
      expect(parseCurrency('NaN')).toBe(0)
    })

    it('should handle currency conversion edge cases', () => {
      expect(formatCurrency(0.001, 'USD')).toBe('$0.00') // Rounded up
      expect(formatCurrency(0.004, 'USD')).toBe('$0.00') // Rounded down
      expect(formatCurrency(0.005, 'USD')).toBe('$0.01') // Rounded up
    })
  })
})
