import { describe, expect, it } from 'vitest'
import { parseDezimal, zahlOder0 } from './zahl'

describe('parseDezimal', () => {
  it('liest deutsche und englische Schreibweise', () => {
    expect(parseDezimal('0,3054')).toBe(0.3054)
    expect(parseDezimal('0.3054')).toBe(0.3054)
    expect(parseDezimal('1.234,56')).toBe(1234.56)
    expect(parseDezimal(' 53416 ')).toBe(53416)
    expect(parseDezimal('-12,5')).toBe(-12.5)
  })
  it('gibt null für leere oder ungültige Eingaben', () => {
    expect(parseDezimal('')).toBeNull()
    expect(parseDezimal('   ')).toBeNull()
    expect(parseDezimal('abc')).toBeNull()
    expect(parseDezimal('1,2,3')).toBeNull()
    expect(parseDezimal(null)).toBeNull()
    expect(parseDezimal(undefined)).toBeNull()
  })
  it('zahlOder0 ersetzt null durch 0', () => {
    expect(zahlOder0('')).toBe(0)
    expect(zahlOder0('7')).toBe(7)
  })
})
