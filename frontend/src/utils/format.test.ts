import { describe, expect, it } from 'vitest'
import { formatCurrencyBRL } from './format'

describe('formatCurrencyBRL', () => {
  it('formats numeric values using pt-BR currency', () => {
    expect(formatCurrencyBRL(149.97)).toMatch(/R\$\s?149,97/)
  })

  it('accepts string values with comma decimal separator', () => {
    expect(formatCurrencyBRL('299,94')).toMatch(/R\$\s?299,94/)
  })

  it('returns zero currency for invalid values', () => {
    expect(formatCurrencyBRL('invalid')).toMatch(/R\$\s?0,00/)
  })
})
