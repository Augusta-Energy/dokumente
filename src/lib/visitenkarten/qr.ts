import { create as qrErzeugen } from 'qrcode'

/** n Module pro Kante, pfad = ein SVG-Pfad in Moduleinheiten (1 Modul = 1 Einheit). */
export type QrPfad = { n: number; pfad: string }

const cache = new Map<string, QrPfad>()

/** Fehlerkorrektur M; jede Zeile wird in horizontale Läufe zusammengefasst. */
export function qrPfad(text: string): QrPfad {
  const vorhanden = cache.get(text)
  if (vorhanden) return vorhanden
  const q = qrErzeugen(text, { errorCorrectionLevel: 'M' })
  const n = q.modules.size
  const d = q.modules.data
  let pfad = ''
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (!d[y * n + x]) continue
      let lauf = 1
      while (x + lauf < n && d[y * n + x + lauf]) lauf++
      pfad += `M${x} ${y}h${lauf}v1h-${lauf}z`
      x += lauf - 1
    }
  }
  const ergebnis = { n, pfad }
  cache.set(text, ergebnis)
  if (cache.size > 60) {
    const aeltester = cache.keys().next().value
    if (aeltester !== undefined) cache.delete(aeltester)
  }
  return ergebnis
}
