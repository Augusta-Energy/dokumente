import { CLAIM, LEISTUNGEN } from '../texte'
import type { Design } from './design'

export const klassik: Design = {
  id: 'klassik',
  nr: '01',
  titel: 'Klassik',
  beschreibung:
    'Die redaktionelle Ruhe der Website: Logo oben links, Rolle als goldene Zeile, Name groß, feine Goldlinie und klar beschriftete Kontaktzeilen – das Foto sitzt als runder Ausschnitt oben rechts.',
  vorderseite(z) {
    const { b, W, H, p, k } = z
    const foto = z.hatFoto()
    let s = z.rect(0, 0, W, H, p.grund)
    s += z.logo(b + 7, b + 7, 7).svg
    if (foto) s += z.foto(b + 60, b + 7, 18)
    s += z.eyebrow(b + 7, b + 24.6, 1.7, p.akzentText, k.rolle, { maxB: foto ? 48 : 64 })
    s += z.text(b + 7, b + 31, 4.4, p.text, k.name, { schrift: 'display', gewicht: 700, ls: 0.02, gross: true, maxB: foto ? 50 : 64 })
    s += z.rect(b + 7, b + 33.2, 14, 0.6, p.akzent)
    s += z.kontaktzeilen(b + 7, b + 39, 3.3, { wertX: b + 16, rechts: b + 78 }).svg
    return s
  },
  rueckseite(z) {
    const { b, W, H, p, k } = z
    const lw = 44
    let s = z.rect(0, 0, W, H, p.grund)
    s += z.logo(b + (85 - lw) / 2, b + 14, lw / 4.7).svg
    s += z.rect(b + 32.5, b + 28.2, 20, 0.5, p.akzent)
    s += z.eyebrow(b + 42.5, b + 34.6, 1.9, p.text, CLAIM, { anker: 'middle' })
    s += z.eyebrow(b + 42.5, b + 39.6, 1.35, p.label, LEISTUNGEN, { ls: 0.14, anker: 'middle' })
    s += z.eyebrow(b + 42.5, b + 46.2, 1.9, p.akzentText, k.web, { ls: 0.16, anker: 'middle', maxB: 70 })
    return s
  },
}
