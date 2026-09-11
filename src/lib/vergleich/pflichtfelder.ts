import { parseDezimal } from '../zahl'
import type { VergleichDaten } from './types'

const leer = (s: string) => s.trim() === ''
const anschriftFehlt = (a: { strasse: string; plz: string; ort: string }) => leer(a.strasse) || leer(a.plz) || leer(a.ort)

/** Bezeichnungen sind für die Nutzerin gedacht („Bitte ergänze: …“). Reihenfolge = Reihenfolge im Formular. */
export function fehlendePflichtfelder(d: VergleichDaten): string[] {
  const fehlt: string[] = []
  if (leer(d.kunde.firma) && leer(d.kunde.nachname)) fehlt.push('Kunde (Firma oder Nachname)')
  if (anschriftFehlt(d.kunde)) fehlt.push('Anschrift des Kunden')
  if (anschriftFehlt(d.lieferstelle)) fehlt.push('Anschrift der Lieferstelle')
  const verbrauch = parseDezimal(d.lieferstelle.jahresverbrauchKwh)
  if (verbrauch == null || verbrauch <= 0) fehlt.push('Jahresverbrauch')
  if (leer(d.lieferstelle.lieferbeginn)) fehlt.push('Lieferbeginn')
  const laufzeit = parseDezimal(d.lieferstelle.laufzeitMonate)
  if (laufzeit == null || !Number.isInteger(laufzeit) || laufzeit < 1) fehlt.push('Laufzeit')
  if (parseDezimal(d.vergleich.ustSatz) == null) fehlt.push('Umsatzsteuersatz')
  if (leer(d.empfehlung.versorger)) fehlt.push('Versorger (Empfehlung)')
  if (parseDezimal(d.empfehlung.arbeitspreisCt) == null) fehlt.push('Arbeitspreis (Empfehlung)')
  if (leer(d.aktuell.versorger)) fehlt.push('Versorger (aktueller Tarif)')
  if (parseDezimal(d.aktuell.arbeitspreisCt) == null) fehlt.push('Arbeitspreis (aktueller Tarif)')
  return fehlt
}
