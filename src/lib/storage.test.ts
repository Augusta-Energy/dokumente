import { describe, expect, it } from 'vitest'
import { lesen, schreiben } from './storage'

function fakeStorage(): Storage {
  const daten = new Map<string, string>()
  return {
    get length() { return daten.size },
    clear: () => daten.clear(),
    getItem: (k) => daten.get(k) ?? null,
    key: (i) => [...daten.keys()][i] ?? null,
    removeItem: (k) => { daten.delete(k) },
    setItem: (k, v) => { daten.set(k, String(v)) },
  }
}

describe('storage', () => {
  it('liest den Fallback, wenn nichts gespeichert ist', () => {
    expect(lesen('x', { a: 1 }, fakeStorage())).toEqual({ a: 1 })
  })
  it('schreibt und liest JSON, ergänzt fehlende Felder aus dem Fallback', () => {
    const s = fakeStorage()
    schreiben('x', { a: 2 }, s)
    expect(lesen('x', { a: 1, b: 'neu' }, s)).toEqual({ a: 2, b: 'neu' })
  })
  it('ignoriert kaputtes JSON und fehlenden Storage', () => {
    const s = fakeStorage()
    s.setItem('x', '{nicht json')
    expect(lesen('x', 5, s)).toBe(5)
    expect(lesen('x', 5, undefined)).toBe(5)
    expect(() => schreiben('x', 1, undefined)).not.toThrow()
  })
})
