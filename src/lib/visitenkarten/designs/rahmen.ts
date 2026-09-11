import type { Zeichner } from '../svg'
import { CLAIM, LEISTUNGEN } from '../texte'
import type { Design } from './design'

/** Goldene Haarlinie 4.5 mm innerhalb der Schnittkante, kleine Goldquadrate in den Ecken. */
function goldRahmen(z: Zeichner): string {
  const { b, p } = z
  let s = z.rect(b + 4.5, b + 4.5, 76, 46, 'none', { stroke: p.akzent, sw: 0.3 })
  for (const [x, y] of [[4.5, 4.5], [80.5, 4.5], [4.5, 50.5], [80.5, 50.5]] as const) {
    s += z.rect(b + x - 0.6, b + y - 0.6, 1.2, 1.2, p.akzent)
  }
  return s
}

export const rahmen: Design = {
  id: 'rahmen',
  nr: '03',
  titel: 'Rahmen',
  beschreibung:
    'Feine Goldlinie als Rahmen mit kleinen Eckpunkten und eine zentrierte Komposition: Marke oder Foto oben, darunter Name, Rolle und die Kontaktdaten in ruhigen Zeilen – die klassische Karte mit Goldkante.',
  vorderseite(z) {
    const { b, W, H, p, k } = z
    let s = z.rect(0, 0, W, H, p.grund) + goldRahmen(z)
    if (z.hatFoto()) s += z.foto(b + 35.5, b + 6.5, 14)
    else s += z.marke(b + 36.24, b + 7.5, 10).svg
    s += z.text(b + 42.5, b + 27.2, 4.2, p.text, k.name, { schrift: 'display', gewicht: 700, ls: 0.03, gross: true, anker: 'middle', maxB: 66 })
    s += z.eyebrow(b + 42.5, b + 31.6, 1.6, p.akzentText, k.rolle, { anker: 'middle', maxB: 66 })
    s += z.rect(b + 36.5, b + 34.2, 12, 0.5, p.akzent)
    // Geviertabstände (U+2003) um den Punkt: normale Leerzeichen würden in SVG zu einem zusammenfallen und wirken zu eng.
    const kontakt = [k.telefon, k.email].filter(Boolean).join(' · ')
    s += z.text(b + 42.5, b + 40, 2.2, p.textSanft, kontakt, { anker: 'middle', gewicht: 500, maxB: 66 })
    s += z.eyebrow(b + 42.5, b + 44.2, 1.6, p.akzentText, k.web, { ls: 0.16, anker: 'middle', maxB: 66 })
    s += z.text(b + 42.5, b + 48.3, 1.9, p.label, k.adresse, { anker: 'middle', maxB: 66 })
    return s
  },
  rueckseite(z) {
    const { b, W, H, p, k } = z
    const lw = 42
    let s = z.rect(0, 0, W, H, p.grund) + goldRahmen(z)
    s += z.logo(b + (85 - lw) / 2, b + 13, lw / 4.7).svg
    s += z.eyebrow(b + 42.5, b + 30.5, 1.35, p.label, LEISTUNGEN, { ls: 0.16, anker: 'middle' })
    s += z.eyebrow(b + 42.5, b + 38.4, 1.8, p.text, CLAIM, { ls: 0.14, anker: 'middle' })
    s += z.eyebrow(b + 42.5, b + 45.6, 1.8, p.akzentText, k.web, { ls: 0.16, anker: 'middle', maxB: 66 })
    return s
  },
}
