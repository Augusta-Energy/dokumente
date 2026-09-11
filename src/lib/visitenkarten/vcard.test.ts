import { describe, expect, it } from 'vitest'
import type { Karte } from './typen'
import { normalisiereTelefon, vcardText } from './vcard'

const karte: Karte = {
  name: 'Niklas Trojovsky',
  rolle: 'Inhaber & Vertriebsleitung',
  telefon: '0151 41378008',
  email: 'info@augusta-energy.de',
  web: 'augusta-energy.de',
  adresse: 'Am Mittleren Moos 53 · 86167 Augsburg',
  qrLink: '',
}

describe('normalisiereTelefon', () => {
  it('macht aus deutschen Nummern internationale', () => {
    expect(normalisiereTelefon('0151 41378008')).toBe('+4915141378008')
    expect(normalisiereTelefon('0049 151 41378008')).toBe('+4915141378008')
    expect(normalisiereTelefon('+49 151 41378008')).toBe('+4915141378008')
  })
})

describe('vcardText', () => {
  it('baut eine vCard 3.0 mit Name, Firma, Rolle, Telefon, E-Mail, URL und Adresse', () => {
    const v = vcardText(karte, 'Augusta Energy')
    const zeilen = v.split('\r\n')
    expect(zeilen[0]).toBe('BEGIN:VCARD')
    expect(zeilen[1]).toBe('VERSION:3.0')
    expect(zeilen).toContain('N:Trojovsky;Niklas;;;')
    expect(zeilen).toContain('FN:Niklas Trojovsky')
    expect(zeilen).toContain('ORG:Augusta Energy')
    expect(zeilen).toContain('TITLE:Inhaber & Vertriebsleitung')
    expect(zeilen).toContain('TEL;TYPE=CELL:+4915141378008')
    expect(zeilen).toContain('EMAIL:info@augusta-energy.de')
    expect(zeilen).toContain('URL:https://augusta-energy.de')
    expect(zeilen).toContain('ADR;TYPE=WORK:;;Am Mittleren Moos 53;Augsburg;;86167;Deutschland')
    expect(zeilen[zeilen.length - 1]).toBe('END:VCARD')
  })

  it('lässt leere Felder weg, nimmt einen Ein-Wort-Namen als Vornamen und escaped Sonderzeichen', () => {
    const v = vcardText({ ...karte, name: 'Zentrale', rolle: 'Beratung; Vertrieb', telefon: '', email: '', web: '', adresse: 'Marktplatz 1' }, '')
    expect(v).toContain('N:;Zentrale;;;')
    expect(v).toContain('TITLE:Beratung\\; Vertrieb')
    expect(v).toContain('ADR;TYPE=WORK:;;Marktplatz 1;;;;')
    expect(v).not.toContain('TEL')
    expect(v).not.toContain('ORG')
  })

  it('behandelt die Karte als Organisation, wenn der Name (getrimmt, ohne Groß-/Kleinschreibung) der Firma entspricht', () => {
    const v = vcardText({ ...karte, name: ' augusta energy ' }, 'Augusta Energy')
    const zeilen = v.split('\r\n')
    expect(zeilen).toContain('N:;;;;')
    expect(zeilen).toContain('FN:Augusta Energy')
    expect(zeilen).toContain('ORG:Augusta Energy')
  })
})
