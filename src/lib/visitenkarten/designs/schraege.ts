import { farben } from '../../../brand/colors'
import type { Punkt, Zeichner } from '../svg'
import { CLAIM, LEISTUNGEN, LEISTUNGEN_KURZ, LEISTUNGEN_ZEILEN } from '../texte'
import type { Design } from './design'

/** Neigung der Panelkante: 8 mm Versatz auf 55 mm Höhe – parallel zur linken Flanke der A-Marke. */
const NEIGUNG = 8 / 55

/** Linkes Panel: Kante von (35, 0) nach (27, 55) in Trim-Koordinaten, über den Beschnitt verlängert. */
function panel(z: Zeichner): Punkt[] {
  const { b, H } = z
  return [[0, 0], [b + 35 + NEIGUNG * b, 0], [b + 27 - NEIGUNG * b, H], [0, H]]
}

export const schraege: Design = {
  id: 'schraege',
  nr: '06',
  titel: 'Schräge',
  beschreibung:
    'Zweifarbig mit Haltung: Ein Panel mit schräger Kante – geneigt wie die Flanke der A-Marke – trägt Marke und Foto, rechts stehen Rolle, Name und Kontakt. Hell mit Ink-Panel auf Papier, dunkel mit Gold-Panel auf Ink.',
  vorderseite(z) {
    const { b, W, H, p, k } = z
    let s = z.rect(0, 0, W, H, p.grund)
    s += z.polygon(panel(z), p.panel)
    s += z.marke(b + 7.5, b + 7.5, 12, { base: p.panelLogoBase, gold: p.panelGold }).svg
    if (z.hatFoto()) {
      s += z.foto(b + 7, b + 31, 16, { ring: p.panelAkzent, platte: z.dunkel ? farben.goldDeep : farben.ink800 })
    } else {
      s += z.rect(b + 7.5, b + 33.5, 8, 0.5, p.panelAkzent)
      LEISTUNGEN_ZEILEN.forEach((zeile, i) => {
        s += z.eyebrow(b + 7.5, b + 38.5 + i * 3.6, 1.3, p.panelText, zeile, { ls: 0.16, opacity: 0.85 })
      })
    }
    s += z.eyebrow(b + 41, b + 16, 1.6, p.akzentText, k.rolle, { maxB: 37 })
    s += z.text(b + 41, b + 22, 3.7, p.text, k.name, { schrift: 'display', gewicht: 700, ls: 0.02, gross: true, maxB: 37 })
    s += z.rect(b + 41, b + 24.1, 12, 0.6, p.akzent)
    s += z.kontaktzeilen(b + 41, b + 30, 3.5, { wertX: b + 49, rechts: b + 78, wertGroesse: 2.15, adresseOhneLabel: true, adresseGroesse: 1.9 }).svg
    s += z.eyebrow(b + 41, b + 48, 1.3, p.label, LEISTUNGEN_KURZ, { ls: 0.12, maxB: 37 })
    return s
  },
  rueckseite(z) {
    const { b, W, H, p, k } = z
    let s = z.rect(0, 0, W, H, p.panel)
    // Schräger Streifen in der Grundfarbe rechts: Kante von (66, 0) nach (58, 55)
    s += z.polygon([[b + 66 + NEIGUNG * b, 0], [W, 0], [W, H], [b + 58 - NEIGUNG * b, H]], p.grund)
    s += z.logo(b + 8, b + 14, 40 / 4.7, { base: p.panelLogoBase, gold: p.panelGold }).svg
    s += z.eyebrow(b + 8, b + 31.5, 1.7, p.panelText, CLAIM, { ls: 0.14, opacity: 0.92, maxB: 48 })
    s += z.eyebrow(b + 8, b + 37.5, 1.3, p.panelText, LEISTUNGEN, { ls: 0.12, opacity: 0.65, maxB: 48 })
    s += z.eyebrow(b + 8, b + 46.5, 1.6, p.panelAkzent, k.web, { ls: 0.16, maxB: 48 })
    return s
  },
}
