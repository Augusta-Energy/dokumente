export type Ansprechpartner = { name: string; rolle: string; telefon: string; email: string }

export type Absender = {
  firma: string
  inhaber: string
  strasse: string
  plz: string
  ort: string
  telefon: string
  email: string
  web: string
  /** Optional – erscheint nur in der Fußzeile, wenn gesetzt. */
  ustIdNr: string
  bank: string
  iban: string
  ansprechpartner: Ansprechpartner
}

export const standardAbsender: Absender = {
  firma: 'Augusta Energy',
  inhaber: 'Niklas Trojovsky',
  strasse: 'Am Mittleren Moos 53',
  plz: '86167',
  ort: 'Augsburg',
  telefon: '0151 41378008',
  email: 'info@augusta-energy.de',
  web: 'augusta-energy.de',
  ustIdNr: '',
  bank: '',
  iban: '',
  ansprechpartner: {
    name: 'Niklas Trojovsky',
    rolle: 'Inhaber & Vertriebsleitung',
    telefon: '0151 41378008',
    email: 'info@augusta-energy.de',
  },
}

/** Schnellauswahl für Ansprechpartner/Unterzeichner. */
export const teamAuswahl: ReadonlyArray<{ name: string; rolle: string }> = [
  { name: 'Niklas Trojovsky', rolle: 'Inhaber & Vertriebsleitung' },
  { name: 'Gabriel Stefa', rolle: 'Strom & Gas Experte' },
  { name: 'Patrick Seebach', rolle: 'Beratung & Projektleitung' },
]
