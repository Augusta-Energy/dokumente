import { create as qrErzeugen } from 'qrcode'

/** n Module pro Kante, pfad = ein SVG-Pfad in Moduleinheiten (1 Modul = 1 Einheit). */
export type QrPfad = { n: number; pfad: string }

const cache = new Map<string, QrPfad | null>()

/** Fehlerkorrektur M; jede Zeile wird in horizontale Läufe zusammengefasst.
 *  Liefert `null`, wenn der Text nicht mehr in einen QR-Code passt (der Encoder wirft dann). */
export function qrPfad(text: string): QrPfad | null {
  if (cache.has(text)) return cache.get(text) ?? null
  let ergebnis: QrPfad | null
  try {
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
    ergebnis = { n, pfad }
  } catch {
    ergebnis = null
  }
  cache.set(text, ergebnis)
  if (cache.size > 60) {
    const aeltester = cache.keys().next().value
    if (aeltester !== undefined) cache.delete(aeltester)
  }
  return ergebnis
}
