import type { Ansprechpartner } from '../absender'

export type Energieart = 'strom' | 'gas'
export const energieartLabel: Record<Energieart, string> = { strom: 'Strom', gas: 'Gas' }

export type Anrede = 'firma' | 'frau' | 'herr' | 'divers'
export type Preisdarstellung = 'netto' | 'brutto'
export type GrundpreisEinheit = 'monat' | 'jahr'

export type Tarif = {
  versorger: string
  preisgarantie: string
  /** ct/kWh netto, als Eingabetext */
  arbeitspreisCt: string
  /** € netto, als Eingabetext */
  grundpreis: string
  grundpreisEinheit: GrundpreisEinheit
}

export type VergleichDaten = {
  kunde: {
    firma: string
    anrede: Anrede
    vorname: string
    nachname: string
    strasse: string
    plz: string
    ort: string
  }
  vergleich: {
    nummer: string
    datum: string
    gueltigkeitTage: string
    preisdarstellung: Preisdarstellung
    ustSatz: string
    hinweise: string
  }
  lieferstelle: {
    strasse: string
    plz: string
    ort: string
    energieart: Energieart
    jahresverbrauchKwh: string
    lieferbeginn: string
    laufzeitMonate: string
  }
  empfehlung: Tarif
  aktuell: Tarif
  honorar: {
    anzeigen: boolean
    anbieterwechsel: string
    konzessionsabgabe: string
  }
  konzessionsabgabe: {
    reduktionProJahr: string
  }
  unterzeichner: { name: string; rolle: string }
}

export const leererTarif: Tarif = { versorger: '', preisgarantie: '', arbeitspreisCt: '', grundpreis: '', grundpreisEinheit: 'jahr' }

export function leererVergleich(heute: string, nummer: string, ansprechpartner: Ansprechpartner): VergleichDaten {
  return {
    kunde: { firma: '', anrede: 'firma', vorname: '', nachname: '', strasse: '', plz: '', ort: '' },
    vergleich: { nummer, datum: heute, gueltigkeitTage: '3', preisdarstellung: 'netto', ustSatz: '19', hinweise: '' },
    lieferstelle: { strasse: '', plz: '', ort: '', energieart: 'strom', jahresverbrauchKwh: '', lieferbeginn: '', laufzeitMonate: '24' },
    empfehlung: { ...leererTarif },
    aktuell: { ...leererTarif },
    honorar: { anzeigen: true, anbieterwechsel: '', konzessionsabgabe: '' },
    konzessionsabgabe: { reduktionProJahr: '' },
    unterzeichner: { name: ansprechpartner.name, rolle: ansprechpartner.rolle },
  }
}

/** Kundenname für Anschrift, Laufzeile und Dateiname. */
export function kundenname(d: VergleichDaten): string {
  const firma = d.kunde.firma.trim()
  if (firma) return firma
  return `${d.kunde.vorname} ${d.kunde.nachname}`.trim()
}
