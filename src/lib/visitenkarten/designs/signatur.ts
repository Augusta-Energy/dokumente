import { farben, mitAlpha } from '../../../brand/colors'
import { LEISTUNGEN } from '../texte'
import type { Design } from './design'

export const signatur: Design = {
  id: 'signatur',
  nr: '02',
  titel: 'Signatur',
  beschreibung:
    'Die A-Marke als großes Wasserzeichen, das rechts über die Kante läuft – der Querbalken in Gold, der Winkel nur angedeutet. Auf der Rückseite das gestapelte Logo wie auf dem runden Markenzeichen.',
  vorderseite(z) {
    const { b, W, H, p, k } = z
    let s = z.rect(0, 0, W, H, p.grund)
    // Wasserzeichen: 64 mm hohe Marke, Spitze an der rechten Schnittkante, Querbalken unten rechts sichtbar
    s += z.marke(b + 44, b - 4.5, 64, {
      base: z.dunkel ? mitAlpha(farben.cream, 0.05) : mitAlpha(farben.ink, 0.045),
      gold: z.dunkel ? mitAlpha(farben.gold, 0.3) : mitAlpha(farben.gold, 0.34),
    }).svg
    s += z.logo(b + 7, b + 7, 7).svg
    if (z.hatFoto()) s += z.foto(b + 61, b + 7, 17)
    s += z.eyebrow(b + 7, b + 26, 1.7, p.akzentText, k.rolle, { maxB: z.hatFoto() ? 50 : 56 })
    s += z.text(b + 7, b + 32.6, 4.6, p.text, k.name, { schrift: 'display', gewicht: 700, ls: 0.02, gross: true, maxB: 52 })
    s += z.rect(b + 7, b + 34.8, 16, 0.7, p.akzent)
    s += z.kontaktzeilen(b + 7, b + 39.8, 3.1, { wertX: b + 16, rechts: b + 70, wertGroesse: 2.2 }).svg
    return s
  },
  rueckseite(z) {
    const { b, W, H, p } = z
    let s = z.rect(0, 0, W, H, p.grund)
    s += z.logoGestapelt(b + 42.5, b + 8, 18).svg
    s += z.eyebrow(b + 42.5, b + 48.6, 1.3, p.label, LEISTUNGEN, { ls: 0.14, anker: 'middle' })
    return s
  },
}
