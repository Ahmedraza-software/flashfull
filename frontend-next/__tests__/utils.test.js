// Test utility functions
import { formatRs, formatRsCompact } from '@/lib/money'

describe('Money Utils', () => {
  test('formatRs should format numbers correctly', () => {
    expect(formatRs(0)).toBe('Rs 0.00')
    expect(formatRs(1000)).toBe('Rs 1000.00')
    expect(formatRs(1234567.89)).toBe('Rs 1234567.89')
    expect(formatRs(-500)).toBe('Rs -500.00')
  })

  test('formatRs should handle null/undefined', () => {
    expect(formatRs(null)).toBe('Rs 0.00')
    expect(formatRs(undefined)).toBe('Rs 0.00')
    expect(formatRs(NaN)).toBe('Rs 0.00')
    expect(formatRs(Infinity)).toBe('Rs 0.00')
  })

  test('formatRs should handle string numbers', () => {
    expect(formatRs('1000')).toBe('Rs 1000.00')
    expect(formatRs('1234.56')).toBe('Rs 1234.56')
  })

  test('formatRs should handle custom decimals', () => {
    expect(formatRs(1234.567, 0)).toBe('Rs 1235')
    expect(formatRs(1234.567, 3)).toBe('Rs 1234.567')
  })

  test('formatRsCompact should format numbers correctly', () => {
    expect(formatRsCompact(0)).toBe('Rs 0')
    expect(formatRsCompact(1000)).toBe('Rs 1000')
    expect(formatRsCompact(1234567.89)).toBe('Rs 1234568')
    expect(formatRsCompact(-500)).toBe('Rs -500')
  })

  test('formatRsCompact should handle null/undefined', () => {
    expect(formatRsCompact(null)).toBe('Rs 0')
    expect(formatRsCompact(undefined)).toBe('Rs 0')
    expect(formatRsCompact(NaN)).toBe('Rs 0')
    expect(formatRsCompact(Infinity)).toBe('Rs 0')
  })
})
