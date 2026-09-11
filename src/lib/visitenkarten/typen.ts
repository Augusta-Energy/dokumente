/** Gemeinsame Typen und Konstanten des Visitenkarten-Generators. Alle Maße in mm. */
export type Farbwelt = 'hell' | 'dunkel'
export type FarbweltWahl = Farbwelt | 'beide'
export type Seite = 'vorderseite' | 'rueckseite'
/** display = Montserrat, text = Raleway */
export type Schrift = 'display' | 'text'

/** Quadratischer Ausschnitt in Quellpixeln, der in den Kreis kommt. */
export type FotoCrop = { x: number; y: number; s: number }
/** src ist eine data-URL (Exporte betten sie ein). */
export type Foto = { src: string; w: number; h: number; crop: FotoCrop }

export type Karte = {
  name: string
  rolle: string
  telefon: string
  email: string
  web: string
  /** „Straße · PLZ Ort“; leer = ausblenden */
  adresse: string
  /** Ziel des Link-QR-Codes (Rückseite Design 05) */
  qrLink: string
}

export type Person = {
  id: string
  /** Beschriftung des Auswahl-Buttons */
  kurz: string
  /** leer = Firmenname aus dem Absender */
  name: string
  rolle: string
  foto?: { datei: string; w: number; h: number; crop: FotoCrop }
}

/** Persistierter Zustand des Tabs (ohne Foto). */
export type VisitenkartenZustand = {
  personId: string | null
  karte: Karte
  fotoAnzeigen: boolean
  hilfslinien: boolean
  beschnittExport: boolean
  farbwelt: FarbweltWahl
}

/** Textbreite in mm für Text, Schriftgröße (mm), Schrift, Gewicht und Laufweite (em). */
export type Messer = (text: string, groesse: number, schrift: Schrift, gewicht: number, ls: number) => number

/** vorschau: Foto per <use href="#vk-foto"> aus der Seite; export: <image> mit data-URL und Schriften-CSS eingebettet. */
export type RenderModus = 'vorschau' | 'export'

export type RenderOptionen = {
  karte: Karte
  /** Firmenname für die vCard (ORG) */
  firma: string
  farbwelt: Farbwelt
  seite: Seite
  /** 0 oder BESCHNITT */
  beschnitt: number
  modus: RenderModus
  /** bereits mit „Foto anzeigen“ verrechnet */
  foto: Foto | null
  hilfslinien?: boolean
  schnittmarken?: boolean
  /** nur modus 'export' */
  schriftenCss?: string
  messer?: Messer
}

export const KARTE = { breite: 85, hoehe: 55 } as const
export const BESCHNITT = 3
export const SICHERHEIT = 5
/** id des in der Seite hinterlegten <image>, das Vorschau-SVGs per <use> referenzieren */
export const FOTO_ID = 'vk-foto'
