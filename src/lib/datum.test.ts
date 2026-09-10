import { describe, expect, it } from 'vitest'
import { addDays, addMonths, gueltigBis, heuteIso, lieferende, parseIso, toIso } from './datum'

describe('datum', () => {
  it('parst und serialisiert ISO-Daten streng', () => {
    expect(parseIso('2026-01-31')).toEqual({ jahr: 2026, monat: 1, tag: 31 })
    expect(parseIso('2026-02-30')).toBeNull()
    expect(parseIso('2026-1-5')).toBeNull()
    expect(parseIso('')).toBeNull()
    expect(toIso(2026, 3, 7)).toBe('2026-03-07')
  })
  it('addiert Monate und klemmt den Tag ans Monatsende', () => {
    expect(addMonths('2026-01-31', 1)).toBe('2026-02-28')
    expect(addMonths('2024-01-31', 1)).toBe('2024-02-29')
    expect(addMonths('2026-01-01', 24)).toBe('2028-01-01')
    expect(addMonths('2026-11-15', 3)).toBe('2027-02-15')
    expect(addMonths('ungültig', 1)).toBeNull()
  })
  it('addiert Tage über Monats- und Jahresgrenzen', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02')
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })
  it('berechnet Lieferende = Beginn + Laufzeit − 1 Tag', () => {
    expect(lieferende('2026-01-01', 24)).toBe('2027-12-31')
    expect(lieferende('2026-03-15', 12)).toBe('2027-03-14')
    expect(lieferende('2026-01-31', 1)).toBe('2026-02-27')
    expect(lieferende('2026-01-01', 0)).toBeNull()
    expect(lieferende('', 12)).toBeNull()
  })
  it('berechnet Gültigkeit in Tagen', () => {
    expect(gueltigBis('2025-04-10', 3)).toBe('2025-04-13')
    expect(gueltigBis('2025-04-10', -1)).toBeNull()
  })
  it('liefert heute als ISO-Datum', () => {
    expect(heuteIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
