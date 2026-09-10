import { describe, expect, it } from 'vitest'
import { ctProKwh, datum, euro, grundpreisText, kwh, monate, prozent, zahl2 } from './format'

describe('format', () => {
  it('formatiert Euro deutsch mit Tausenderpunkt', () => {
    expect(euro(16436.36)).toBe('16.436,36 €')
    expect(euro(0)).toBe('0,00 €')
    expect(euro(-369.5)).toBe('-369,50 €')
    expect(euro(null)).toBe('–')
  })
  it('formatiert Arbeitspreis, Verbrauch, Laufzeit, Prozent', () => {
    expect(ctProKwh(30.54)).toBe('30,54 ct/kWh')
    expect(ctProKwh(30.5)).toBe('30,50 ct/kWh')
    expect(kwh(53416)).toBe('53.416 kWh')
    expect(monate(24)).toBe('24 Monate')
    expect(monate(1)).toBe('1 Monat')
    expect(prozent(19)).toBe('19 %')
    expect(prozent(7.5)).toBe('7,5 %')
    expect(zahl2(1234.5)).toBe('1.234,50')
  })
  it('formatiert ISO-Daten deutsch', () => {
    expect(datum('2025-04-10')).toBe('10.04.2025')
    expect(datum('')).toBe('–')
    expect(datum('2025-13-40')).toBe('–')
    expect(datum(undefined)).toBe('–')
  })
  it('formatiert Grundpreis mit Einheit', () => {
    expect(grundpreisText(123.11, 'jahr')).toBe('123,11 €/Jahr')
    expect(grundpreisText(9.9, 'monat')).toBe('9,90 €/Monat')
    expect(grundpreisText(null, 'jahr')).toBe('–')
  })
  it('behandelt NaN/Infinity als „–“ und glättet -0 zu 0', () => {
    expect(euro(NaN)).toBe('–')
    expect(euro(Infinity)).toBe('–')
    expect(euro(-Infinity)).toBe('–')
    expect(ctProKwh(NaN)).toBe('–')
    expect(kwh(NaN)).toBe('–')
    expect(kwh(Infinity)).toBe('–')
    expect(monate(NaN)).toBe('–')
    expect(prozent(NaN)).toBe('–')
    expect(grundpreisText(NaN, 'jahr')).toBe('–')
    expect(zahl2(NaN)).toBe('–')
    expect(zahl2(Infinity)).toBe('–')
    expect(kwh(-0)).toBe('0 kWh')
    expect(prozent(-0)).toBe('0 %')
  })
})
