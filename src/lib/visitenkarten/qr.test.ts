import { describe, expect, it } from 'vitest'
import { qrPfad } from './qr'

describe('qrPfad', () => {
  it('codiert eine kurze URL als Version 2 (25 Module) mit einem Pfad aus horizontalen Läufen', () => {
    const q = qrPfad('https://augusta-energy.de')
    if (!q) throw new Error('erwartet: kurze URL passt in einen QR-Code')
    expect(q.n).toBe(25)
    expect(q.pfad.startsWith('M0 0h7v1h-7z')).toBe(true) // linke obere Ecke des Suchmusters
    expect(q.pfad).not.toContain('NaN')
  })

  it('liefert für denselben Text dasselbe Objekt aus dem Cache', () => {
    expect(qrPfad('BEGIN:VCARD')).toBe(qrPfad('BEGIN:VCARD'))
  })

  it('liefert null, wenn der Text nicht in einen QR-Code passt', () => {
    expect(qrPfad('x'.repeat(3000))).toBeNull()
  })
})
