/** Parst Zahlen so, wie deutsche Nutzer sie tippen: „0,3054“, „1.234,56“, aber auch „0.3054“.
 *  Ohne Komma gilt der Punkt als Dezimaltrennzeichen („1.234“ → 1.234). */
export function parseDezimal(eingabe: string | null | undefined): number | null {
  if (eingabe == null) return null
  const s = eingabe.replace(/\s/g, '')
  if (s === '') return null
  const normalisiert = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s
  if (!/^-?\d+(\.\d+)?$/.test(normalisiert)) return null
  const n = Number(normalisiert)
  return Number.isFinite(n) ? n : null
}

export function zahlOder0(eingabe: string): number {
  return parseDezimal(eingabe) ?? 0
}
