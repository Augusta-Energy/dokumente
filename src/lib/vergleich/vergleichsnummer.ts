import { heuteIso } from '../datum'

/** Ohne 0/O, 1/I – die Nummer wird am Telefon vorgelesen. */
const ZEICHEN = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function neueVergleichsnummer(datumIso: string = heuteIso(), zufall: () => number = Math.random): string {
  let suffix = ''
  for (let i = 0; i < 4; i++) {
    suffix += ZEICHEN[Math.min(ZEICHEN.length - 1, Math.floor(zufall() * ZEICHEN.length))]
  }
  return `AE-${datumIso.replace(/-/g, '')}-${suffix}`
}
