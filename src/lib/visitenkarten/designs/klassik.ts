import type { Design } from './design'

/** Platzhalter – das Layout kommt in einem eigenen Task. */
export const klassik: Design = {
  id: 'klassik',
  nr: '01',
  titel: 'Klassik',
  beschreibung: 'Platzhalter.',
  vorderseite(z) {
    const { b, W, H, p, k } = z
    return z.rect(0, 0, W, H, p.grund) + z.text(b + 7, b + 30, 4, p.text, k.name, { schrift: 'display', gewicht: 700, gross: true, maxB: 64 }) + z.foto(b + 60, b + 7, 18)
  },
  rueckseite(z) {
    const { b, W, H, p, k } = z
    return z.rect(0, 0, W, H, p.grund) + z.logo(b + 20.5, b + 22, 9.36).svg + z.eyebrow(b + 42.5, b + 46.2, 1.9, p.akzentText, k.web, { ls: 0.16, anker: 'middle', maxB: 70 })
  },
}
