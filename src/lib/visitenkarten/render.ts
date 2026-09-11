import type { Design } from './designs/design'
import { PALETTEN } from './palette'
import { N, Zeichner } from './svg'
import { KARTE, SICHERHEIT, type RenderOptionen } from './typen'

type HuellenOptionen = { b: number; uid: string; schriftenCss?: string; hilfslinien?: boolean; schnittmarken?: boolean }

/** SVG-Dokument um den inneren String: Schriften (Export), Sättigungsfilter, Hilfslinien, Schnittmarken. */
export function svgDokument(inner: string, o: HuellenOptionen): string {
  const b = o.b
  const W = KARTE.breite + 2 * b
  const H = KARTE.hoehe + 2 * b
  const stil = o.schriftenCss ? `<style>${o.schriftenCss}</style>` : ''
  const filter = `<defs><filter id="sat-${o.uid}"><feColorMatrix type="saturate" values="0.5"/></filter></defs>`
  let overlay = ''
  if (o.hilfslinien && b > 0) {
    overlay += `<rect x="${N(b)}" y="${N(b)}" width="${KARTE.breite}" height="${KARTE.hoehe}" fill="none" stroke="#e11d48" stroke-width="0.25" stroke-dasharray="1.6 1.1"/>`
    overlay += `<rect x="${N(b + SICHERHEIT)}" y="${N(b + SICHERHEIT)}" width="${KARTE.breite - 2 * SICHERHEIT}" height="${KARTE.hoehe - 2 * SICHERHEIT}" fill="none" stroke="#0284c7" stroke-width="0.2" stroke-dasharray="1 1"/>`
  }
  if (o.schnittmarken && b > 0) {
    const g = 0.8
    const L = b - g
    const marke = (x1: number, y1: number, x2: number, y2: number) =>
      `<line x1="${N(x1)}" y1="${N(y1)}" x2="${N(x2)}" y2="${N(y2)}" stroke="#888888" stroke-width="0.15"/>`
    const R = b + KARTE.breite
    const U = b + KARTE.hoehe
    overlay +=
      marke(b, 0, b, L) + marke(R, 0, R, L) + marke(b, U + g, b, H) + marke(R, U + g, R, H) +
      marke(0, b, L, b) + marke(0, U, L, U) + marke(R + g, b, W, b) + marke(R + g, U, W, U)
  }
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${N(W)}mm" height="${N(H)}mm" viewBox="0 0 ${N(W)} ${N(H)}">${stil}${filter}${inner}${overlay}</svg>`
  )
}

export function renderKarte(design: Design, o: RenderOptionen): string {
  const b = o.beschnitt
  const uid = `${design.id}-${o.farbwelt}-${o.seite}-${b}${o.hilfslinien ? 'g' : ''}${o.schnittmarken ? 't' : ''}`
  const z = new Zeichner({ b, uid, p: PALETTEN[o.farbwelt], k: o.karte, firma: o.firma, dunkel: o.farbwelt === 'dunkel', foto: o.foto, modus: o.modus, messer: o.messer })
  const inner = o.seite === 'vorderseite' ? design.vorderseite(z) : design.rueckseite(z)
  return svgDokument(inner, { b, uid, schriftenCss: o.modus === 'export' ? o.schriftenCss : undefined, hilfslinien: o.hilfslinien, schnittmarken: o.schnittmarken })
}
