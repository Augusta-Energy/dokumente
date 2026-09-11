import { CLAIM, INSTAGRAM_HANDLE, LEISTUNGEN } from '../texte'
import type { Design } from './design'

export const portraet: Design = {
  id: 'portraet',
  nr: '04',
  titel: 'Porträt',
  beschreibung:
    'Das Gesicht im Mittelpunkt: großes rundes Foto mit Goldring links, rechts Logo, Rolle, Name und Kontakt. Ohne Foto trägt der Goldring die Marke als Monogramm. Die Rückseite ist die Kontrastfläche – Ink mit hellem Logo oder Gold mit dunklem.',
  vorderseite(z) {
    const { b, W, H, p, k } = z
    let s = z.rect(0, 0, W, H, p.grund)
    if (z.hatFoto()) {
      s += z.foto(b + 7, b + 14.5, 26, { rw: 0.6 })
    } else {
      s += z.kreis(b + 20, b + 27.5, 13, p.platte, { stroke: p.akzent, sw: 0.6 })
      s += z.marke(b + 12.48, b + 21.5, 12).svg
    }
    const lw = 28
    s += z.logo(b + 78 - lw, b + 6.5, lw / 4.7).svg
    s += z.eyebrow(b + 38, b + 20.5, 1.6, p.akzentText, k.rolle, { maxB: 40 })
    s += z.text(b + 38, b + 26.5, 3.8, p.text, k.name, { schrift: 'display', gewicht: 700, ls: 0.02, gross: true, maxB: 40 })
    s += z.rect(b + 38, b + 28.6, 12, 0.6, p.akzent)
    s += z.kontaktzeilen(b + 38, b + 34.4, 3.4, { wertX: b + 46, rechts: b + 78, wertGroesse: 2.15, adresseOhneLabel: true, adresseGroesse: 1.9 }).svg
    return s
  },
  rueckseite(z) {
    const { b, W, H, p, k } = z
    const lw = 46
    let s = z.rect(0, 0, W, H, p.panel)
    s += z.logo(b + (85 - lw) / 2, b + 15, lw / 4.7, { base: p.panelLogoBase, gold: p.panelGold }).svg
    s += z.eyebrow(b + 42.5, b + 32.6, 1.9, p.panelText, CLAIM, { ls: 0.16, anker: 'middle', opacity: 0.92 })
    s += z.eyebrow(b + 42.5, b + 38.2, 1.35, p.panelText, LEISTUNGEN, { ls: 0.14, anker: 'middle', opacity: 0.65 })
    s += z.eyebrow(b + 7, b + 48.4, 1.45, p.panelAkzent, k.web, { ls: 0.14, maxB: 40 })
    s += z.eyebrow(b + 78, b + 48.4, 1.45, p.panelAkzent, INSTAGRAM_HANDLE, { ls: 0.14, anker: 'end' })
    return s
  },
}
