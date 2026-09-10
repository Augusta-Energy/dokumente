import { describe, expect, it } from 'vitest'
import { neueVergleichsnummer } from './vergleichsnummer'

describe('neueVergleichsnummer', () => {
  it('hat das Format AE-JJJJMMTT-XXXX ohne verwechselbare Zeichen', () => {
    for (let i = 0; i < 50; i++) {
      expect(neueVergleichsnummer('2026-09-10')).toMatch(/^AE-20260910-[A-HJ-NP-Z2-9]{4}$/)
    }
  })
  it('ist bei festem Zufall deterministisch', () => {
    expect(neueVergleichsnummer('2026-09-10', () => 0)).toBe('AE-20260910-AAAA')
    expect(neueVergleichsnummer('2026-09-10', () => 0.999)).toBe('AE-20260910-9999')
  })
})
