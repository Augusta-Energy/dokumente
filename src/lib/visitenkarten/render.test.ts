import { describe, expect, it } from 'vitest'
import { DESIGNS } from './designs'
import { renderKarte } from './render'
import { KARTE, SICHERHEIT, type Farbwelt, type Foto, type Karte, type RenderOptionen, type Seite } from './typen'

const karte: Karte = {
  name: 'Niklas Trojovsky',
  rolle: 'Inhaber & Vertriebsleitung',
  telefon: '0151 41378008',
  email: 'info@augusta-energy.de',
  web: 'augusta-energy.de',
  adresse: 'Am Mittleren Moos 53 · 86167 Augsburg',
  qrLink: 'https://augusta-energy.de',
}
const foto: Foto = { src: 'data:image/jpeg;base64,AAAA', w: 900, h: 1200, crop: { x: 200, y: 100, s: 520 } }
const farbwelten: Farbwelt[] = ['hell', 'dunkel']
const seiten: Seite[] = ['vorderseite', 'rueckseite']

function optionen(teil: Partial<RenderOptionen>): RenderOptionen {
  return { karte, firma: 'Augusta Energy', farbwelt: 'hell', seite: 'vorderseite', beschnitt: 0, modus: 'vorschau', foto, ...teil }
}

/** Grundlinien aller <text>-Elemente (x, y) – nur direkte Attribute, keine Logo-Texte in verschachtelten <svg>. */
function textPositionen(svg: string): Array<[number, number]> {
  const ohneLogos = svg.replace(/<svg [^>]*viewBox="0 0 (470 100|307 245)"[\s\S]*?<\/svg>/g, '')
  return [...ohneLogos.matchAll(/<text x="([\d.-]+)" y="([\d.-]+)"/g)].map((m) => [Number(m[1]), Number(m[2])])
}

describe('renderKarte', () => {
  it('rendert alle Designs in beiden Farbwelten und Seiten ohne NaN/undefined', () => {
    for (const design of DESIGNS) {
      for (const farbwelt of farbwelten) {
        for (const seite of seiten) {
          const svg = renderKarte(design, optionen({ farbwelt, seite }))
          expect(svg.startsWith('<?xml')).toBe(true)
          expect(svg.endsWith('</svg>')).toBe(true)
          expect(svg).not.toContain('NaN')
          expect(svg).not.toContain('undefined')
          expect(svg).toContain(`width="${KARTE.breite}mm"`)
        }
      }
    }
  })

  it('hält den Sicherheitsabstand: jede Text-Grundlinie liegt im Bereich x 5–80, y 5–49.6', () => {
    for (const design of DESIGNS) {
      for (const farbwelt of farbwelten) {
        for (const seite of seiten) {
          for (const modusFoto of [foto, null]) {
            const svg = renderKarte(design, optionen({ farbwelt, seite, foto: modusFoto }))
            for (const [x, y] of textPositionen(svg)) {
              expect(x, `${design.id}/${farbwelt}/${seite} x`).toBeGreaterThanOrEqual(SICHERHEIT)
              expect(x, `${design.id}/${farbwelt}/${seite} x`).toBeLessThanOrEqual(KARTE.breite - SICHERHEIT)
              expect(y, `${design.id}/${farbwelt}/${seite} y`).toBeGreaterThanOrEqual(SICHERHEIT)
              expect(y, `${design.id}/${farbwelt}/${seite} y`).toBeLessThanOrEqual(KARTE.hoehe - SICHERHEIT - 0.4)
            }
          }
        }
      }
    }
  })

  it('referenziert das Foto in der Vorschau per <use> und bettet es im Export ein', () => {
    const vorschau = renderKarte(DESIGNS[0], optionen({}))
    expect(vorschau).toContain('href="#vk-foto"')
    expect(vorschau).not.toContain('data:image/jpeg')
    const exportSvg = renderKarte(DESIGNS[0], optionen({ modus: 'export', schriftenCss: '@font-face{}' }))
    expect(exportSvg).toContain('data:image/jpeg;base64,AAAA')
    expect(exportSvg).toContain('<style>@font-face{}</style>')
  })

  it('zeichnet Hilfslinien und Schnittmarken nur mit Beschnitt', () => {
    const ohne = renderKarte(DESIGNS[0], optionen({ hilfslinien: true, schnittmarken: true }))
    expect(ohne).not.toContain('#e11d48')
    const mit = renderKarte(DESIGNS[0], optionen({ beschnitt: 3, hilfslinien: true, schnittmarken: true }))
    expect(mit).toContain('width="91mm"')
    expect(mit).toContain('#e11d48')
    expect(mit).toContain('#0284c7')
    expect(mit).toContain('#888888')
  })
})
