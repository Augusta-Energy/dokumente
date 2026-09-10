import type { VollmachtDaten } from './types'

const leer = (s: string) => s.trim() === ''

export function fehlendePflichtfelder(d: VollmachtDaten): string[] {
  const fehlt: string[] = []
  if (leer(d.vollmachtgeber.name)) fehlt.push('Name des Vollmachtgebers')
  if (leer(d.vollmachtgeber.strasse) || leer(d.vollmachtgeber.plz) || leer(d.vollmachtgeber.ort)) fehlt.push('Anschrift des Vollmachtgebers')
  if (!d.energiearten.strom && !d.energiearten.gas) fehlt.push('Mindestens eine Energieart')
  if (d.lieferstellen.length === 0) fehlt.push('Mindestens eine Lieferstelle')
  d.lieferstellen.forEach((l, i) => {
    if (leer(l.adresse)) fehlt.push(`Adresse der Lieferstelle ${i + 1}`)
  })
  if (d.geltung.art === 'befristet' && leer(d.geltung.bis)) fehlt.push('Befristung (Datum)')
  return fehlt
}
