import { parseIso } from './datum'

export const LEER = '–'

const nf2 = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const nf0 = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 })
const nfProzent = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 2 })

export function zahl2(n: number): string {
  // Intl liefert bei -0 ein „-0,00“; das vermeiden wir.
  return nf2.format(Object.is(n, -0) ? 0 : n)
}

export function euro(betrag: number | null): string {
  return betrag == null ? LEER : `${zahl2(betrag)} €`
}

export function ctProKwh(ct: number | null): string {
  return ct == null ? LEER : `${zahl2(ct)} ct/kWh`
}

export function kwh(menge: number | null): string {
  return menge == null ? LEER : `${nf0.format(menge)} kWh`
}

export function monate(n: number | null): string {
  if (n == null) return LEER
  return n === 1 ? '1 Monat' : `${nf0.format(n)} Monate`
}

export function prozent(p: number | null): string {
  return p == null ? LEER : `${nfProzent.format(p)} %`
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
  if (betrag == null) return LEER
  return `${zahl2(betrag)} €/${einheit === 'monat' ? 'Monat' : 'Jahr'}`
}
