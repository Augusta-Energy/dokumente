import { describe, expect, it } from 'vitest'
import { beschraenkungEinleitung, bevollmaechtigungsSatz, energieartenText, geltungSatz, umfangPunkte, untervollmachtSatz, versorgungText } from './texte'
import { leereVollmacht } from './types'

describe('Vollmacht-Texte', () => {
  it('benennt die Energiearten', () => {
    expect(energieartenText({ strom: true, gas: true })).toBe('Strom und Gas')
    expect(energieartenText({ strom: true, gas: false })).toBe('Strom')
    expect(energieartenText({ strom: false, gas: true })).toBe('Gas')
    expect(energieartenText({ strom: false, gas: false })).toBe('Energie')
    expect(versorgungText({ strom: true, gas: true })).toBe('Strom- und Gasversorgung')
    expect(versorgungText({ strom: true, gas: false })).toBe('Stromversorgung')
    expect(versorgungText({ strom: false, gas: true })).toBe('Gasversorgung')
    expect(versorgungText({ strom: false, gas: false })).toBe('Energieversorgung')
  })
  it('formuliert ich/wir je nach Vollmachtgeber-Typ', () => {
    const privat = leereVollmacht()
    expect(bevollmaechtigungsSatz(privat)).toContain('bevollmächtige ich')
    expect(bevollmaechtigungsSatz(privat)).toContain(' mich ')
    const firma = leereVollmacht()
    firma.vollmachtgeber.typ = 'unternehmen'
    expect(bevollmaechtigungsSatz(firma)).toContain('bevollmächtigen wir')
    expect(bevollmaechtigungsSatz(firma)).toContain(' uns ')
    expect(bevollmaechtigungsSatz(firma)).toContain('Versorgung mit Strom und Gas')
  })
  it('setzt die Energieart in Umfang und Beschränkung ein', () => {
    const d = leereVollmacht()
    d.energiearten = { strom: false, gas: true }
    const punkte = umfangPunkte(d)
    expect(punkte).toHaveLength(7)
    expect(punkte[1]).toContain('Lieferung von Gas')
    expect(beschraenkungEinleitung(d)).toContain('Gasversorgung')
  })
  it('formuliert Geltungsdauer und Untervollmacht', () => {
    const d = leereVollmacht()
    expect(geltungSatz(d, 'info@augusta-energy.de')).toContain('unbefristet bis auf Widerruf')
    expect(geltungSatz(d, 'info@augusta-energy.de')).toContain('per E-Mail an info@augusta-energy.de')
    d.geltung = { art: 'befristet', bis: '2027-12-31' }
    expect(geltungSatz(d, 'x@y.de')).toContain('bis zum 31.12.2027')
    expect(untervollmachtSatz(d)).toContain('nicht gestattet')
    d.untervollmacht = true
    expect(untervollmachtSatz(d)).toBe('Die Bevollmächtigte ist berechtigt, Untervollmacht zu erteilen.')
  })
})
