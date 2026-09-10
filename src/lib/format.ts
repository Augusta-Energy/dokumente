import { parseIso } from './datum'

export const LEER = '–'

const nf2 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nf0 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 })
const nfProzent = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 })

/** Gemeinsame Schutzklausel aller Zahlen-Formatierer: kein `null`, kein NaN/Infinity. */
function gueltigeZahl(n: number | null): n is number {
  return n != null && Number.isFinite(n)
}

/** Intl liefert bei -0 ein führendes Minus („-0,00“); das vermeiden wir für alle Formatierer. */
function ohneMinusNull(n: number): number {
  return Object.is(n, -0) ? 0 : n
}

export function zahl2(n: number): string {
  return gueltigeZahl(n) ? nf2.format(ohneMinusNull(n)) : LEER
}

export function euro(betrag: number | null): string {
  return gueltigeZahl(betrag) ? `${zahl2(betrag)} €` : LEER
}

export function ctProKwh(ct: number | null): string {
  return gueltigeZahl(ct) ? `${zahl2(ct)} ct/kWh` : LEER
}

export function kwh(menge: number | null): string {
  return gueltigeZahl(menge) ? `${nf0.format(ohneMinusNull(menge))} kWh` : LEER
}

export function monate(n: number | null): string {
  if (!gueltigeZahl(n)) return LEER
  return n === 1 ? '1 Monat' : `${nf0.format(ohneMinusNull(n))} Monate`
}

export function prozent(p: number | null): string {
  return gueltigeZahl(p) ? `${nfProzent.format(ohneMinusNull(p))} %` : LEER
}

export function datum(iso: string | null | undefined): string {
  if (!iso) return LEER
  const d = parseIso(iso)
  if (!d) return LEER
  const tt = String(d.tag).padStart(2, '0')
  const mm = String(d.monat).padStart(2, '0')
  return `${tt}.${mm}.${d.jahr}`
}

export function grundpreisText(betrag: number | null, einheit: 'monat' | 'jahr'): string {
  if (!gueltigeZahl(betrag)) return LEER
  return `${zahl2(betrag)} €/${einheit === 'monat' ? 'Monat' : 'Jahr'}`
}
