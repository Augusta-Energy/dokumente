export type Datumsteile = { jahr: number; monat: number; tag: number }

export function parseIso(iso: string): Datumsteile | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  const jahr = Number(m[1])
  const monat = Number(m[2])
  const tag = Number(m[3])
  const d = new Date(Date.UTC(jahr, monat - 1, tag))
  if (d.getUTCFullYear() !== jahr || d.getUTCMonth() !== monat - 1 || d.getUTCDate() !== tag) return null
  return { jahr, monat, tag }
}

export function toIso(jahr: number, monat: number, tag: number): string {
  return `${String(jahr).padStart(4, '0')}-${String(monat).padStart(2, '0')}-${String(tag).padStart(2, '0')}`
}

function ausUtc(d: Date): string {
  return toIso(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate())
}

export function heuteIso(): string {
  const jetzt = new Date()
  return toIso(jetzt.getFullYear(), jetzt.getMonth() + 1, jetzt.getDate())
}

export function addMonths(iso: string, monate: number): string | null {
  const d = parseIso(iso)
  if (!d || !Number.isInteger(monate)) return null
  const erster = new Date(Date.UTC(d.jahr, d.monat - 1 + monate, 1))
  const letzterTag = new Date(Date.UTC(erster.getUTCFullYear(), erster.getUTCMonth() + 1, 0)).getUTCDate()
  return ausUtc(new Date(Date.UTC(erster.getUTCFullYear(), erster.getUTCMonth(), Math.min(d.tag, letzterTag))))
}

export function addDays(iso: string, tage: number): string | null {
  const d = parseIso(iso)
  if (!d || !Number.isInteger(tage)) return null
  return ausUtc(new Date(Date.UTC(d.jahr, d.monat - 1, d.tag + tage)))
}

/** Lieferende = Lieferbeginn + Laufzeit − 1 Tag (01.01.2026 + 24 Monate → 31.12.2027). */
export function lieferende(lieferbeginn: string, laufzeitMonate: number): string | null {
  if (!Number.isInteger(laufzeitMonate) || laufzeitMonate < 1) return null
  const ende = addMonths(lieferbeginn, laufzeitMonate)
  return ende ? addDays(ende, -1) : null
}

export function gueltigBis(datumIso: string, tage: number): string | null {
  if (!Number.isInteger(tage) || tage < 0) return null
  return addDays(datumIso, tage)
}
