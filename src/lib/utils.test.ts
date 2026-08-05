import { describe, expect, it } from 'vitest'
import { cn, formatCurrency, formatNumber, initials } from './utils'

describe('cn', () => {
  it('merges class names and resolves tailwind conflicts', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})

describe('formatCurrency', () => {
  it('formats a number as INR with no decimals', () => {
    expect(formatCurrency(42000)).toBe('₹42,000')
  })
})

describe('formatNumber', () => {
  it('formats with Indian digit grouping', () => {
    expect(formatNumber(150000)).toBe('1,50,000')
  })
})

describe('initials', () => {
  it('takes the first letter of the first two words', () => {
    expect(initials('Aditi Sharma')).toBe('AS')
  })

  it('handles a single-word name', () => {
    expect(initials('Cher')).toBe('C')
  })
})
