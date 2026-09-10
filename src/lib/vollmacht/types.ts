export type VollmachtgeberTyp = 'privat' | 'unternehmen'
export type LieferstellenEnergieart = 'strom' | 'gas' | 'beide'
export const lieferstellenEnergieartLabel: Record<LieferstellenEnergieart, string> = {
  strom: 'Strom',
  gas: 'Gas',
  beide: 'Strom und Gas',
}

export type Lieferstelle = {
  id: string
  /** „Musterstraße 12, 86150 Augsburg“ – eine Zeile */
  adresse: string
  energieart: LieferstellenEnergieart
  zaehlernummer: string
  maloId: string
  versorger: string
}

export type Energiearten = { strom: boolean; gas: boolean }

export type VollmachtDaten = {
  vollmachtgeber: {
    typ: VollmachtgeberTyp
    /** Firma (unternehmen) bzw. „Vorname Nachname“ (privat) */
    name: string
    vertretenDurch: string
    strasse: string
    plz: string
    ort: string
    geburtsdatum: string
    email: string
    telefon: string
  }
  energiearten: Energiearten
  lieferstellen: Lieferstelle[]
  geltung: { art: 'unbefristet' | 'befristet'; bis: string }
  untervollmacht: boolean
  unterschrift: { ort: string; datum: string }
}

export function neueId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2)
}

export function neueLieferstelle(): Lieferstelle {
  return { id: neueId(), adresse: '', energieart: 'beide', zaehlernummer: '', maloId: '', versorger: '' }
}

export function leereVollmacht(): VollmachtDaten {
  return {
    vollmachtgeber: { typ: 'privat', name: '', vertretenDurch: '', strasse: '', plz: '', ort: '', geburtsdatum: '', email: '', telefon: '' },
    energiearten: { strom: true, gas: true },
    lieferstellen: [neueLieferstelle()],
    geltung: { art: 'unbefristet', bis: '' },
    untervollmacht: false,
    unterschrift: { ort: '', datum: '' },
  }
}

export function vollmachtgeberName(d: VollmachtDaten): string {
  return d.vollmachtgeber.name.trim()
}
