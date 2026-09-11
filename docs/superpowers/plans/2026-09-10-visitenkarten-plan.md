# Visitenkarten-Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dritter Tab „Visitenkarten“ in der Dokumente-App: sechs Designs × hell/dunkel × Vorder-/Rückseite, live aus Kartendetails gerendert, mit SVG/PNG/Druck-PDF-Exporten und Druckansicht – die Logik des SAFE-G-Visitenkarten-Designers, übertragen auf Augusta Energy.

**Architecture:** Reine TypeScript-Render-Engine (`src/lib/visitenkarten/`): Layouts sind Funktionen `(z: Zeichner) => string`, die mm-Koordinaten in SVG-Strings übersetzen; Farbwelten sind Paletten. Der React-Tab (`src/ui/visitenkarten/`) hält Zustand, lädt Fotos, rendert die 24 Vorschauen als inline SVG und ruft die Exporte (Canvas-Rasterung, Raster-PDF-Writer, Druckfenster). Keine neue Bibliothek außer `qrcode`.

**Tech Stack:** Vite 8, React 19, TypeScript 6 (`erasableSyntaxOnly`, `verbatimModuleSyntax`), Tailwind 4, Vitest 5 (`environment: 'node'`), `qrcode` 1.5, Fontsource Montserrat/Raleway (woff2 via Vite `?inline`).

**Spec:** `docs/superpowers/specs/2026-09-10-visitenkarten-design.md`

## Global Constraints

- Sprache: UI-Texte, Bezeichner und Kommentare auf Deutsch, wie im Rest der Codebasis (`Karte`, `Zeichner`, `renderKarte`).
- TypeScript: keine Parameter-Properties, keine Enums (`erasableSyntaxOnly`); Typimporte mit `import type` (`verbatimModuleSyntax`); `noUnusedLocals`/`noUnusedParameters` gelten.
- Keine weiteren Abhängigkeiten als die bereits installierten `qrcode` 1.5.4 und `@types/qrcode` (bereits in `package.json`).
- Geometrie: `KARTE = 85 × 55 mm`, `BESCHNITT = 3`, `SICHERHEIT = 5`. Jeder `<text>` liegt bei Beschnitt 0 im Bereich x ∈ [5, 80], y (Grundlinie) ∈ [5, 49.6] – `render.test.ts` prüft das für alle Designs.
- Farben nur über `PALETTEN` (`palette.ts`) bzw. `farben` (`src/brand/colors.ts`); Schriften nur Montserrat (`display`) und Raleway (`text`).
- Foto: Sättigung 0.5 (Filter `sat-<uid>`), Goldring, Modus `vorschau` = `<use href="#vk-foto">`, Modus `export` = eingebettetes `<image>`.
- Exporte: SVG mit Schriften-CSS; PNG `round(mm / 25.4 × dpi)`; Druck-PDF 1.4 mit MediaBox = BleedBox = 91 × 61 mm und TrimBox 3 mm eingerückt, 600 dpi; verlustfrei = FlateDecode über `CompressionStream`; Druckansicht `@page { size: 91mm 61mm; margin: 0 }`.
- Dateinamen: `Augusta-Energy_Visitenkarte_<nr>-<Titel>_<Hell|Dunkel>_<Name>` + Suffixe (Spec §7).
- Tests proportional: nur die im Plan genannten Testdateien, keine jsdom-Tests der Oberfläche.
- Vor jedem Commit: `npm run lint`, `npm test`, `npm run build` grün (Build enthält `tsc -b`).
- `src/lib/visitenkarten/typen.ts` liegt bereits auf `main` und wird nicht verändert.

## Dateistruktur

| Datei | Verantwortung | Task |
|---|---|---|
| `src/lib/visitenkarten/typen.ts` | Typen, Konstanten (vorhanden) | – |
| `src/lib/visitenkarten/palette.ts` | Farbwelten hell/dunkel | 1 |
| `src/lib/visitenkarten/texte.ts` | Claim, Leistungszeile, Instagram, Standard-URL | 1 |
| `src/lib/visitenkarten/vcard.ts` (+test) | Telefon-Normalisierung, vCard | 1 |
| `src/lib/visitenkarten/qr.ts` (+test) | QR-Pfad mit Cache | 1 |
| `src/lib/visitenkarten/personen.ts` | Team-Voreinstellungen, Karte aus Absender, URLs | 1 |
| `src/lib/visitenkarten/textbreite.ts` | Breitenschätzung, Canvas-Messer | 1 |
| `src/lib/visitenkarten/svg.ts` | `Zeichner` (Primitive, Logo, Foto, QR, Kontaktzeilen) | 1 |
| `src/lib/visitenkarten/render.ts` (+test) | `svgDokument`, `renderKarte` | 1 |
| `src/lib/visitenkarten/dateiname.ts` (+test) | Dateinamen der Exporte | 1 |
| `src/lib/visitenkarten/designs/design.ts`, `index.ts`, sechs Design-Dateien (Platzhalter) | Design-Vertrag und Registry | 1 (Platzhalter), 4–6 (Layouts) |
| `src/brand/fonts.svg.ts` (vorhanden), `fonts.svg.node.ts` | Schriften-CSS für Exporte (Node-Variante fürs Skript) | 1 |
| `scripts/render-visitenkarten.ts` | 24 SVGs + Galerien nach `out/visitenkarten/` | 1 |
| `src/brand/fonts.svg.browser.ts` | Schriften-CSS im Browser (`?inline`) | 2 |
| `src/lib/visitenkarten/pdfRaster.ts` (+test) | Minimaler PDF-Writer (JPEG/Flate, TrimBox) | 2 |
| `src/ui/visitenkarten/exporte.ts` | Download, Rasterung, SVG/PNG/PDF-Export | 2 |
| `src/ui/visitenkarten/druckansicht.ts` | Druckfenster → Vektor-PDF | 2 |
| `src/ui/visitenkarten/fotoLaden.ts` | Team-Foto laden, eigenes Foto lesen | 3 |
| `src/ui/visitenkarten/KartenPanel.tsx`, `DesignSektion.tsx`, `KartenVorschau.tsx`, `DruckHinweise.tsx`, `VisitenkartenWorkspace.tsx` | Oberfläche des Tabs | 3 |
| `src/App.tsx`, `src/App.test.tsx`, `README.md` | Integration | 7 |

Ausführungsreihenfolge: Welle 1 = Task 1 ‖ Task 2; Welle 2 = Task 3 ‖ Task 4 ‖ Task 5 ‖ Task 6; Welle 3 = Task 7.

---

### Task 1: Render-Engine, Registry mit Platzhalter-Designs, Render-Skript

**Files:**
- Create: `src/lib/visitenkarten/palette.ts`, `texte.ts`, `vcard.ts`, `vcard.test.ts`, `qr.ts`, `qr.test.ts`, `personen.ts`, `textbreite.ts`, `svg.ts`, `render.ts`, `render.test.ts`, `dateiname.ts`, `dateiname.test.ts`, `designs/design.ts`, `designs/index.ts`, `designs/klassik.ts`, `designs/signatur.ts`, `designs/rahmen.ts`, `designs/portraet.ts`, `designs/kontakt.ts`, `designs/schraege.ts`
- Create: `src/brand/fonts.svg.node.ts`, `scripts/render-visitenkarten.ts` (`src/brand/fonts.svg.ts` mit `schriftenCss` liegt bereits auf `main`)
- Modify: `package.json` (Skript `render:visitenkarten`)

**Interfaces:**
- Consumes: `typen.ts` (vorhanden), `src/brand/colors.ts` (`farben`), `src/brand/logoGeometry.ts`, `src/lib/absender.ts` (`Absender`, `standardAbsender`), `src/lib/dateiname.ts` (`slug`).
- Produces: `renderKarte(design: Design, o: RenderOptionen): string`; `Zeichner` mit den unten definierten Methoden; `DESIGNS: readonly Design[]`; `PERSONEN`, `findePerson`, `personKarte`, `webUrl`, `whatsappUrl`; `canvasMesser()`; `dateiBasis`, `svgDateiname`, `pngDateiname`, `pdfDateiname`; `schriftenCss(q)`, `SCHRIFTEN_CSS_NODE`.

- [ ] **Step 1: Palette und Texte**

`src/lib/visitenkarten/palette.ts`:

```ts
import { farben } from '../../brand/colors'
import type { Farbwelt } from './typen'

export type Palette = {
  grund: string
  text: string
  textSanft: string
  label: string
  akzent: string
  /** Gold als Textfarbe: auf hellem Grund das tiefere Gold */
  akzentText: string
  linie: string
  /** Platte hinter dem Foto */
  platte: string
  logoBase: string
  /** Kontrastfläche: hell → Ink, dunkel → Gold */
  panel: string
  panelText: string
  panelLogoBase: string
  /** Goldteile der Marke auf der Kontrastfläche */
  panelGold: string
  /** Akzentfarbe auf der Kontrastfläche */
  panelAkzent: string
}

export const PALETTEN: Record<Farbwelt, Palette> = {
  hell: {
    grund: farben.paper,
    text: farben.ink,
    textSanft: farben.ink600,
    label: farben.muted,
    akzent: farben.gold,
    akzentText: farben.goldDeep,
    linie: farben.line,
    platte: farben.line,
    logoBase: farben.ink,
    panel: farben.ink,
    panelText: farben.cream,
    panelLogoBase: farben.cream,
    panelGold: farben.gold,
    panelAkzent: farben.gold,
  },
  dunkel: {
    grund: farben.ink,
    text: farben.cream,
    textSanft: 'rgba(245,243,238,0.82)',
    label: 'rgba(245,243,238,0.55)',
    akzent: farben.gold,
    akzentText: farben.gold,
    linie: farben.lineDark,
    platte: farben.ink800,
    logoBase: farben.cream,
    panel: farben.gold,
    panelText: farben.ink,
    panelLogoBase: farben.ink,
    panelGold: farben.cream,
    panelAkzent: farben.ink,
  },
}
```

`src/lib/visitenkarten/texte.ts`:

```ts
export const CLAIM = 'ENERGIE. EINFACH BESSER GELÖST.'
export const LEISTUNGEN = 'PHOTOVOLTAIK · WÄRMEPUMPEN · STROM · GAS'
export const LEISTUNGEN_KURZ = 'PV · WÄRMEPUMPEN · STROM · GAS'
export const LEISTUNGEN_ZEILEN = ['PHOTOVOLTAIK', 'WÄRMEPUMPEN', 'STROM & GAS'] as const
export const INSTAGRAM_HANDLE = '@augustaenergy'
export const INSTAGRAM_URL = 'https://www.instagram.com/augustaenergy/'
export const STANDARD_URL = 'https://augusta-energy.de'
```

- [ ] **Step 2: vCard – Test zuerst**

`src/lib/visitenkarten/vcard.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import type { Karte } from './typen'
import { normalisiereTelefon, vcardText } from './vcard'

const karte: Karte = {
  name: 'Niklas Trojovsky',
  rolle: 'Inhaber & Vertriebsleitung',
  telefon: '0151 41378008',
  email: 'info@augusta-energy.de',
  web: 'augusta-energy.de',
  adresse: 'Am Mittleren Moos 53 · 86167 Augsburg',
  qrLink: '',
}

describe('normalisiereTelefon', () => {
  it('macht aus deutschen Nummern internationale', () => {
    expect(normalisiereTelefon('0151 41378008')).toBe('+4915141378008')
    expect(normalisiereTelefon('0049 151 41378008')).toBe('+4915141378008')
    expect(normalisiereTelefon('+49 151 41378008')).toBe('+4915141378008')
  })
})

describe('vcardText', () => {
  it('baut eine vCard 3.0 mit Name, Firma, Rolle, Telefon, E-Mail, URL und Adresse', () => {
    const v = vcardText(karte, 'Augusta Energy')
    const zeilen = v.split('\r\n')
    expect(zeilen[0]).toBe('BEGIN:VCARD')
    expect(zeilen[1]).toBe('VERSION:3.0')
    expect(zeilen).toContain('N:Trojovsky;Niklas;;;')
    expect(zeilen).toContain('FN:Niklas Trojovsky')
    expect(zeilen).toContain('ORG:Augusta Energy')
    expect(zeilen).toContain('TITLE:Inhaber & Vertriebsleitung')
    expect(zeilen).toContain('TEL;TYPE=CELL:+4915141378008')
    expect(zeilen).toContain('EMAIL:info@augusta-energy.de')
    expect(zeilen).toContain('URL:https://augusta-energy.de')
    expect(zeilen).toContain('ADR;TYPE=WORK:;;Am Mittleren Moos 53;Augsburg;;86167;Deutschland')
    expect(zeilen[zeilen.length - 1]).toBe('END:VCARD')
  })

  it('lässt leere Felder weg, nimmt einen Ein-Wort-Namen als Vornamen und escaped Sonderzeichen', () => {
    const v = vcardText({ ...karte, name: 'Zentrale', rolle: 'Beratung; Vertrieb', telefon: '', email: '', web: '', adresse: 'Marktplatz 1' }, '')
    expect(v).toContain('N:;Zentrale;;;')
    expect(v).toContain('TITLE:Beratung\\; Vertrieb')
    expect(v).toContain('ADR;TYPE=WORK:;;Marktplatz 1;;;;')
    expect(v).not.toContain('TEL')
    expect(v).not.toContain('ORG')
  })
})
```

- [ ] **Step 3: Test laufen lassen – muss fehlschlagen**

Run: `npx vitest run src/lib/visitenkarten/vcard.test.ts`
Expected: FAIL (Modul `./vcard` fehlt)

- [ ] **Step 4: vCard implementieren**

`src/lib/visitenkarten/vcard.ts`:

```ts
import type { Karte } from './typen'

/** „0151 …“ → „+49151…“, „0049 …“ → „+49…“; Leerzeichen und Trennzeichen fallen weg. */
export function normalisiereTelefon(t: string): string {
  let s = t.replace(/[^\d+]/g, '')
  if (s.startsWith('00')) s = '+' + s.slice(2)
  else if (s.startsWith('0')) s = '+49' + s.slice(1)
  return s
}

/** vCard-Wert: Backslash, Semikolon und Komma müssen escaped werden (RFC 2426). */
function wert(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/[;,]/g, (z) => '\\' + z)
}

/** vCard 3.0 (CRLF). Nachname = letztes Wort; ein einzelnes Wort gilt als Vorname. */
export function vcardText(k: Karte, firma: string): string {
  const teile = k.name.trim().split(/\s+/).filter(Boolean)
  const nachname = teile.length > 1 ? teile[teile.length - 1] : ''
  const vorname = teile.length > 1 ? teile.slice(0, -1).join(' ') : (teile[0] ?? '')
  const zeilen = ['BEGIN:VCARD', 'VERSION:3.0', `N:${wert(nachname)};${wert(vorname)};;;`, `FN:${wert(k.name.trim())}`]
  if (firma) zeilen.push(`ORG:${wert(firma)}`)
  if (k.rolle) zeilen.push(`TITLE:${wert(k.rolle)}`)
  if (k.telefon) zeilen.push(`TEL;TYPE=CELL:${normalisiereTelefon(k.telefon)}`)
  if (k.email) zeilen.push(`EMAIL:${k.email}`)
  if (k.web) zeilen.push(`URL:${/^https?:/i.test(k.web) ? k.web : 'https://' + k.web}`)
  if (k.adresse) {
    const seg = k.adresse.split('·').map((s) => s.trim())
    const m = seg[1] ? seg[1].match(/^(\d{4,5})\s+(.+)$/) : null
    zeilen.push(
      m ? `ADR;TYPE=WORK:;;${wert(seg[0])};${wert(m[2])};;${m[1]};Deutschland` : `ADR;TYPE=WORK:;;${wert(k.adresse)};;;;`,
    )
  }
  zeilen.push('END:VCARD')
  return zeilen.join('\r\n')
}
```

- [ ] **Step 5: Test grün**

Run: `npx vitest run src/lib/visitenkarten/vcard.test.ts`
Expected: PASS (3 Tests)

- [ ] **Step 6: QR – Test zuerst**

`src/lib/visitenkarten/qr.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { qrPfad } from './qr'

describe('qrPfad', () => {
  it('codiert eine kurze URL als Version 2 (25 Module) mit einem Pfad aus horizontalen Läufen', () => {
    const q = qrPfad('https://augusta-energy.de')
    expect(q.n).toBe(25)
    expect(q.pfad.startsWith('M0 0h7v1h-7z')).toBe(true) // linke obere Ecke des Suchmusters
    expect(q.pfad).not.toContain('NaN')
  })

  it('liefert für denselben Text dasselbe Objekt aus dem Cache', () => {
    expect(qrPfad('BEGIN:VCARD')).toBe(qrPfad('BEGIN:VCARD'))
  })
})
```

- [ ] **Step 7: Test laufen lassen – muss fehlschlagen**

Run: `npx vitest run src/lib/visitenkarten/qr.test.ts`
Expected: FAIL (Modul `./qr` fehlt)

- [ ] **Step 8: QR implementieren**

`src/lib/visitenkarten/qr.ts`:

```ts
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
```

- [ ] **Step 9: Test grün**

Run: `npx vitest run src/lib/visitenkarten/qr.test.ts`
Expected: PASS (2 Tests)

- [ ] **Step 10: Personen, Textbreite**

`src/lib/visitenkarten/personen.ts`:

```ts
import type { Absender } from '../absender'
import type { Karte, Person } from './typen'
import { normalisiereTelefon } from './vcard'

/** Team-Voreinstellungen. Telefon/E-Mail/Adresse kommen aus dem Absender (Panel „Absender“).
 *  Fotos liegen unter public/visitenkarten/team/ (Kopien der Website-Fotos). */
export const PERSONEN: readonly Person[] = [
  { id: 'niklas', kurz: 'Niklas', name: 'Niklas Trojovsky', rolle: 'Inhaber & Vertriebsleitung', foto: { datei: 'niklas-trojovsky.jpg', w: 898, h: 1200, crop: { x: 205, y: 120, s: 520 } } },
  { id: 'gabriel', kurz: 'Gabriel', name: 'Gabriel Stefa', rolle: 'Strom & Gas Experte', foto: { datei: 'gabriel-stefa.jpg', w: 900, h: 1200, crop: { x: 195, y: 110, s: 520 } } },
  { id: 'patrick', kurz: 'Patrick', name: 'Patrick Seebach', rolle: 'Beratung & Projektleitung', foto: { datei: 'patrick-seebach.jpg', w: 900, h: 1200, crop: { x: 210, y: 110, s: 520 } } },
  { id: 'zentrale', kurz: 'Zentrale', name: '', rolle: 'Photovoltaik · Wärmepumpen · Strom & Gas' },
]

export function findePerson(id: string | null | undefined): Person | undefined {
  return id ? PERSONEN.find((p) => p.id === id) : undefined
}

/** „augusta-energy.de“ → „https://augusta-energy.de“; leer bleibt leer. */
export function webUrl(web: string): string {
  const w = web.trim()
  if (!w) return ''
  return /^https?:\/\//i.test(w) ? w : `https://${w}`
}

/** wa.me erwartet die internationale Nummer ohne „+“. */
export function whatsappUrl(telefon: string): string {
  const n = normalisiereTelefon(telefon).replace(/\D/g, '')
  return n ? `https://wa.me/${n}` : ''
}

export function personKarte(p: Person, a: Absender): Karte {
  const ortszeile = [a.plz, a.ort].filter(Boolean).join(' ')
  return {
    name: p.name || a.firma,
    rolle: p.rolle,
    telefon: a.telefon,
    email: a.email,
    web: a.web,
    adresse: [a.strasse, ortszeile].filter(Boolean).join(' · '),
    qrLink: webUrl(a.web),
  }
}
```

`src/lib/visitenkarten/textbreite.ts`:

```ts
import type { Messer, Schrift } from './typen'

export const FAMILIE_CSS: Record<Schrift, string> = {
  display: "'Montserrat', Arial, sans-serif",
  text: "'Raleway', Arial, sans-serif",
}

/** Schätzung ohne Browser: Montserrat ist breit (0.68 em je Großbuchstabe), Raleway schmaler. */
export const schaetzeBreite: Messer = (text, groesse, schrift, _gewicht, ls) => {
  const n = text.length
  if (n === 0) return 0
  const gross = text === text.toUpperCase() && /[A-ZÄÖÜ]/.test(text)
  const proEm = schrift === 'display' ? (gross ? 0.68 : 0.6) : 0.52
  return n * groesse * proEm + Math.max(0, n - 1) * groesse * ls
}

/** Echte Breiten über Canvas – erst sinnvoll, wenn document.fonts.ready erfüllt ist. */
export function canvasMesser(): Messer | null {
  if (typeof document === 'undefined') return null
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return null
  return (text, groesse, schrift, gewicht, ls) => {
    if (!text) return 0
    ctx.font = `${gewicht} 100px ${FAMILIE_CSS[schrift]}`
    return (ctx.measureText(text).width / 100) * groesse + Math.max(0, text.length - 1) * groesse * ls
  }
}
```

- [ ] **Step 11: Zeichner**

`src/lib/visitenkarten/svg.ts`:

```ts
import { BAR_POINTS, CHEVRON_POINTS, LEG_POINTS, LOGO_VIEWBOX, MARKE_SCALE, MARKE_VIEWBOX } from '../../brand/logoGeometry'
import type { Palette } from './palette'
import { webUrl } from './personen'
import { qrPfad, type QrPfad } from './qr'
import { STANDARD_URL } from './texte'
import { FAMILIE_CSS, schaetzeBreite } from './textbreite'
import { FOTO_ID, KARTE, type Foto, type Karte, type Messer, type RenderModus, type Schrift } from './typen'
import { vcardText } from './vcard'

export const N = (v: number): string => (Math.round(v * 1000) / 1000).toString()
export const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export type Gewicht = 400 | 500 | 600 | 700
export type TextOpt = {
  schrift?: Schrift
  gewicht?: Gewicht
  /** Laufweite in em */
  ls?: number
  anker?: 'start' | 'middle' | 'end'
  opacity?: number
  /** Maximalbreite in mm – bei Überbreite wird der Text per textLength gestaucht */
  maxB?: number
  gross?: boolean
}
export type FormOpt = { rx?: number; stroke?: string; sw?: number; opacity?: number; dash?: string }
export type LogoOpt = { base?: string; gold?: string; opacity?: number }
export type FotoOpt = { ring?: string; rw?: number; platte?: string }
export type QrOpt = { ruhe?: number; stroke?: string; sw?: number }
export type KontaktOpt = {
  labelFill?: string
  wertFill?: string
  wertGroesse?: number
  wertGewicht?: Gewicht
  wertX?: number
  /** rechter Rand der Werte (absolut, inkl. Beschnitt) */
  rechts?: number
  adresseOhneLabel?: boolean
  adresseGroesse?: number
  ohneAdresse?: boolean
}
export type Punkt = readonly [number, number]

export type ZeichnerKontext = {
  b: number
  uid: string
  p: Palette
  k: Karte
  firma: string
  dunkel: boolean
  foto: Foto | null
  modus: RenderModus
  messer?: Messer
}

const LOGO_SEITENVERHAELTNIS = LOGO_VIEWBOX.breite / LOGO_VIEWBOX.hoehe // 4.7
const MARKE_SEITENVERHAELTNIS = MARKE_VIEWBOX.breite / MARKE_VIEWBOX.hoehe // 1.253

/** Zeichnet SVG-Fragmente in mm. Alle Koordinaten sind absolut (Layouts addieren `b` selbst). */
export class Zeichner {
  readonly b: number
  readonly W: number
  readonly H: number
  readonly uid: string
  readonly p: Palette
  readonly k: Karte
  readonly firma: string
  readonly dunkel: boolean
  readonly foto: Foto | null
  readonly modus: RenderModus
  private readonly messer: Messer

  constructor(c: ZeichnerKontext) {
    this.b = c.b
    this.W = KARTE.breite + 2 * c.b
    this.H = KARTE.hoehe + 2 * c.b
    this.uid = c.uid
    this.p = c.p
    this.k = c.k
    this.firma = c.firma
    this.dunkel = c.dunkel
    this.foto = c.foto
    this.modus = c.modus
    this.messer = c.messer ?? schaetzeBreite
  }

  breite(text: string, groesse: number, o: TextOpt = {}): number {
    return this.messer(o.gross ? text.toUpperCase() : text, groesse, o.schrift ?? 'text', o.gewicht ?? 400, o.ls ?? 0)
  }

  private formAttr(o: FormOpt): string {
    return (
      (o.rx ? ` rx="${N(o.rx)}"` : '') +
      (o.stroke ? ` stroke="${o.stroke}" stroke-width="${N(o.sw ?? 0.25)}"` : '') +
      (o.dash ? ` stroke-dasharray="${o.dash}"` : '') +
      (o.opacity !== undefined ? ` opacity="${N(o.opacity)}"` : '')
    )
  }

  rect(x: number, y: number, w: number, h: number, fill: string, o: FormOpt = {}): string {
    return `<rect x="${N(x)}" y="${N(y)}" width="${N(w)}" height="${N(h)}" fill="${fill}"${this.formAttr(o)}/>`
  }

  polygon(punkte: readonly Punkt[], fill: string, o: FormOpt = {}): string {
    return `<polygon points="${punkte.map(([x, y]) => `${N(x)},${N(y)}`).join(' ')}" fill="${fill}"${this.formAttr(o)}/>`
  }

  kreis(cx: number, cy: number, r: number, fill: string, o: FormOpt = {}): string {
    return `<circle cx="${N(cx)}" cy="${N(cy)}" r="${N(r)}" fill="${fill}"${this.formAttr(o)}/>`
  }

  linie(x1: number, y1: number, x2: number, y2: number, stroke: string, sw = 0.25, o: { opacity?: number; dash?: string } = {}): string {
    return `<line x1="${N(x1)}" y1="${N(y1)}" x2="${N(x2)}" y2="${N(y2)}" stroke="${stroke}" stroke-width="${N(sw)}"${o.dash ? ` stroke-dasharray="${o.dash}"` : ''}${o.opacity !== undefined ? ` opacity="${N(o.opacity)}"` : ''}/>`
  }

  /** Leerer Text ergibt einen leeren String, damit optionale Felder einfach durchgereicht werden können. */
  text(x: number, y: number, groesse: number, fill: string, inhalt: string, o: TextOpt = {}): string {
    const s = o.gross ? inhalt.toUpperCase() : inhalt
    if (!s) return ''
    const schrift = o.schrift ?? 'text'
    const gewicht = o.gewicht ?? 400
    const attr = [`x="${N(x)}" y="${N(y)}"`, `font-family="${FAMILIE_CSS[schrift]}"`, `font-size="${N(groesse)}"`, `font-weight="${gewicht}"`, `fill="${fill}"`]
    if (o.ls) attr.push(`letter-spacing="${N(o.ls * groesse)}"`)
    if (o.anker) attr.push(`text-anchor="${o.anker}"`)
    if (o.opacity !== undefined) attr.push(`opacity="${N(o.opacity)}"`)
    if (o.maxB && this.breite(s, groesse, { ...o, gross: false }) > o.maxB) attr.push(`textLength="${N(o.maxB)}" lengthAdjust="spacingAndGlyphs"`)
    return `<text ${attr.join(' ')}>${esc(s)}</text>`
  }

  /** Montserrat 600, Großbuchstaben, Laufweite 0.18 em – die Eyebrow-Zeile der Website. */
  eyebrow(x: number, y: number, groesse: number, fill: string, inhalt: string, o: TextOpt = {}): string {
    return this.text(x, y, groesse, fill, inhalt, { schrift: 'display', gewicht: 600, ls: 0.18, gross: true, ...o })
  }

  private markeFormen(base: string, gold: string): string {
    return `<polygon points="${CHEVRON_POINTS}" fill="${base}"/><polygon points="${LEG_POINTS}" fill="${gold}"/><polygon points="${BAR_POINTS}" fill="${gold}"/>`
  }

  /** Vollständiges Logo (Marke + Wortmarke) wie auf der Website; `hoehe` ist die Höhe der Marke. Breite = 4.7 × Höhe. */
  logo(x: number, y: number, hoehe: number, o: LogoOpt = {}): { w: number; svg: string } {
    const base = o.base ?? this.p.logoBase
    const gold = o.gold ?? this.p.akzent
    const w = hoehe * LOGO_SEITENVERHAELTNIS
    const svg =
      `<svg x="${N(x)}" y="${N(y)}" width="${N(w)}" height="${N(hoehe)}" viewBox="0 0 ${LOGO_VIEWBOX.breite} ${LOGO_VIEWBOX.hoehe}"${o.opacity !== undefined ? ` opacity="${N(o.opacity)}"` : ''}>` +
      `<g transform="scale(${MARKE_SCALE})">${this.markeFormen(base, gold)}</g>` +
      `<text font-family="${FAMILIE_CSS.display}" x="155" y="50.5" font-size="45.7" font-weight="600" textLength="315" lengthAdjust="spacing" fill="${base}">AUGUSTA</text>` +
      `<rect x="163" y="73.3" width="63.7" height="1.4" fill="${gold}"/>` +
      `<text font-family="${FAMILIE_CSS.display}" x="312.5" y="81.6" font-size="22.4" font-weight="600" text-anchor="middle" textLength="157.5" lengthAdjust="spacing" fill="${gold}">ENERGY</text>` +
      `<rect x="398.3" y="73.3" width="63.7" height="1.4" fill="${gold}"/></svg>`
    return { w, svg }
  }

  /** Nur die A-Marke. Breite = 1.253 × Höhe. */
  marke(x: number, y: number, hoehe: number, o: LogoOpt = {}): { w: number; svg: string } {
    const base = o.base ?? this.p.logoBase
    const gold = o.gold ?? this.p.akzent
    const w = hoehe * MARKE_SEITENVERHAELTNIS
    const svg = `<svg x="${N(x)}" y="${N(y)}" width="${N(w)}" height="${N(hoehe)}" viewBox="0 0 ${MARKE_VIEWBOX.breite} ${MARKE_VIEWBOX.hoehe}"${o.opacity !== undefined ? ` opacity="${N(o.opacity)}"` : ''}>${this.markeFormen(base, gold)}</svg>`
    return { w, svg }
  }

  /** Marke, darunter AUGUSTA und — ENERGY — zentriert um cx (wie das runde Logo der Website). */
  logoGestapelt(cx: number, y: number, markenHoehe: number, o: LogoOpt = {}): { h: number; svg: string } {
    const base = o.base ?? this.p.logoBase
    const gold = o.gold ?? this.p.akzent
    const marke = this.marke(cx - (markenHoehe * MARKE_SEITENVERHAELTNIS) / 2, y, markenHoehe, o)
    const fs = markenHoehe * 0.42
    const y1 = y + markenHoehe + fs * 1.35
    const wortOpt: TextOpt = { schrift: 'display', gewicht: 600, ls: 0.25, anker: 'middle' }
    const fs2 = fs * 0.52
    const y2 = y1 + fs2 * 1.9
    const energyOpt: TextOpt = { schrift: 'display', gewicht: 600, ls: 0.34, anker: 'middle' }
    const halb = this.breite('AUGUSTA', fs, wortOpt) / 2
    const innen = this.breite('ENERGY', fs2, energyOpt) / 2 + fs2 * 0.6
    const ly = y2 - fs2 * 0.33
    const linien = halb > innen ? this.rect(cx - halb, ly, halb - innen, 0.25, gold) + this.rect(cx + innen, ly, halb - innen, 0.25, gold) : ''
    const svg = marke.svg + this.text(cx, y1, fs, base, 'AUGUSTA', wortOpt) + linien + this.text(cx, y2, fs2, gold, 'ENERGY', energyOpt)
    return { h: y2 - y, svg }
  }

  hatFoto(): boolean {
    return this.foto !== null
  }

  /** Rundes, halb entsättigtes Foto mit Platte und Goldring. Leerer String ohne Foto. */
  foto(x: number, y: number, d: number, o: FotoOpt = {}): string {
    const f = this.foto
    if (!f) return ''
    const r = d / 2
    const cx = x + r
    const cy = y + r
    const c = f.crop
    const id = `pc-${this.uid}-${N(x)}-${N(y)}`.replace(/\./g, '_')
    const filter = `filter="url(#sat-${this.uid})"`
    const bild =
      this.modus === 'vorschau'
        ? `<use href="#${FOTO_ID}" ${filter}/>`
        : `<image xlink:href="${f.src}" href="${f.src}" x="0" y="0" width="${f.w}" height="${f.h}" ${filter}/>`
    return (
      `<clipPath id="${id}"><circle cx="${N(cx)}" cy="${N(cy)}" r="${N(r)}"/></clipPath>` +
      this.kreis(cx, cy, r, o.platte ?? this.p.platte) +
      `<g clip-path="url(#${id})"><svg x="${N(x)}" y="${N(y)}" width="${N(d)}" height="${N(d)}" viewBox="${N(c.x)} ${N(c.y)} ${N(c.s)} ${N(c.s)}">${bild}</svg></g>` +
      this.kreis(cx, cy, r, 'none', { stroke: o.ring ?? this.p.akzent, sw: o.rw ?? 0.5 })
    )
  }

  /** QR-Code auf weißer Platte mit Ruhezone. */
  qrPlatte(q: QrPfad, x: number, y: number, groesse: number, o: QrOpt = {}): string {
    const ruhe = o.ruhe ?? Math.max(1.6, groesse * 0.085)
    const m = (groesse - 2 * ruhe) / q.n
    return (
      this.rect(x, y, groesse, groesse, '#ffffff', { rx: 0.6, stroke: o.stroke, sw: o.sw ?? 0.3 }) +
      `<g transform="translate(${N(x + ruhe)} ${N(y + ruhe)}) scale(${N(m)})"><path d="${q.pfad}" fill="#111315"/></g>`
    )
  }

  vcardQr(): QrPfad {
    return qrPfad(vcardText(this.k, this.firma))
  }

  linkQr(): QrPfad {
    return qrPfad(this.k.qrLink.trim() || webUrl(this.k.web) || STANDARD_URL)
  }

  kontaktzeilenDaten(o: { ohneAdresse?: boolean } = {}): Array<[string, string]> {
    const k = this.k
    const zeilen: Array<[string, string]> = []
    if (k.telefon) zeilen.push(['TEL', k.telefon])
    if (k.email) zeilen.push(['MAIL', k.email])
    if (k.web) zeilen.push(['WEB', k.web])
    if (k.adresse && !o.ohneAdresse) zeilen.push(['ADR', k.adresse])
    return zeilen
  }

  /** Kontaktzeilen mit Label (Montserrat 600, 1.4 mm) und Wert (Raleway) ab yStart, Zeilenabstand pitch. */
  kontaktzeilen(x: number, yStart: number, pitch: number, o: KontaktOpt = {}): { svg: string; anzahl: number } {
    const zeilen = this.kontaktzeilenDaten(o)
    const wertX = o.wertX ?? x + 8.2
    const rechts = o.rechts ?? this.b + KARTE.breite - 7
    const labelFill = o.labelFill ?? this.p.label
    const wertFill = o.wertFill ?? this.p.textSanft
    const groesse = o.wertGroesse ?? 2.3
    const gewicht = o.wertGewicht ?? 400
    let svg = ''
    zeilen.forEach(([label, wert], i) => {
      const y = yStart + i * pitch
      if (label === 'ADR' && o.adresseOhneLabel) {
        svg += this.text(x, y, o.adresseGroesse ?? 2.05, wertFill, wert, { gewicht, maxB: rechts - x })
        return
      }
      svg += this.text(x, y, 1.4, labelFill, label, { schrift: 'display', gewicht: 600, ls: 0.14 })
      svg += this.text(wertX, y, groesse, wertFill, wert, { gewicht, maxB: rechts - wertX })
    })
    return { svg, anzahl: zeilen.length }
  }
}
```

- [ ] **Step 12: Design-Vertrag, Registry und sechs Platzhalter**

`src/lib/visitenkarten/designs/design.ts`:

```ts
import type { Zeichner } from '../svg'

export type DesignId = 'klassik' | 'signatur' | 'rahmen' | 'portraet' | 'kontakt' | 'schraege'

export type Design = {
  id: DesignId
  nr: string
  titel: string
  beschreibung: string
  vorderseite: (z: Zeichner) => string
  rueckseite: (z: Zeichner) => string
}
```

`src/lib/visitenkarten/designs/index.ts`:

```ts
import { klassik } from './klassik'
import { kontakt } from './kontakt'
import { portraet } from './portraet'
import { rahmen } from './rahmen'
import { schraege } from './schraege'
import { signatur } from './signatur'
import type { Design } from './design'

export type { Design, DesignId } from './design'

export const DESIGNS: readonly Design[] = [klassik, signatur, rahmen, portraet, kontakt, schraege]
```

Sechs Platzhalter-Dateien mit identischem Aufbau; Werte je Datei:

| Datei | export | id | nr | titel |
|---|---|---|---|---|
| `klassik.ts` | `klassik` | `'klassik'` | `'01'` | `'Klassik'` |
| `signatur.ts` | `signatur` | `'signatur'` | `'02'` | `'Signatur'` |
| `rahmen.ts` | `rahmen` | `'rahmen'` | `'03'` | `'Rahmen'` |
| `portraet.ts` | `portraet` | `'portraet'` | `'04'` | `'Porträt'` |
| `kontakt.ts` | `kontakt` | `'kontakt'` | `'05'` | `'Kontakt-QR'` |
| `schraege.ts` | `schraege` | `'schraege'` | `'06'` | `'Schräge'` |

Vorlage (hier für `klassik.ts`; die anderen fünf entsprechend der Tabelle):

```ts
import type { Design } from './design'

/** Platzhalter – das Layout kommt in einem eigenen Task. */
export const klassik: Design = {
  id: 'klassik',
  nr: '01',
  titel: 'Klassik',
  beschreibung: 'Platzhalter.',
  vorderseite(z) {
    const { b, W, H, p, k } = z
    return z.rect(0, 0, W, H, p.grund) + z.text(b + 7, b + 30, 4, p.text, k.name, { schrift: 'display', gewicht: 700, gross: true, maxB: 64 }) + z.foto(b + 60, b + 7, 18)
  },
  rueckseite(z) {
    const { b, W, H, p } = z
    return z.rect(0, 0, W, H, p.grund) + z.logo(b + 20.5, b + 22, 9.36).svg
  },
}
```

- [ ] **Step 13: Render – Test zuerst**

`src/lib/visitenkarten/render.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { DESIGNS } from './designs'
import { renderKarte } from './render'
import { KARTE, SICHERHEIT, type Farbwelt, type Foto, type Karte, type RenderOptionen, type Seite } from './typen'

const karte: Karte = {
  name: 'Niklas Trojovsky',
  rolle: 'Inhaber & Vertriebsleitung',
  telefon: '0151 41378008',
  email: 'info@augusta-energy.de',
  web: 'augusta-energy.de',
  adresse: 'Am Mittleren Moos 53 · 86167 Augsburg',
  qrLink: 'https://augusta-energy.de',
}
const foto: Foto = { src: 'data:image/jpeg;base64,AAAA', w: 900, h: 1200, crop: { x: 200, y: 100, s: 520 } }
const farbwelten: Farbwelt[] = ['hell', 'dunkel']
const seiten: Seite[] = ['vorderseite', 'rueckseite']

function optionen(teil: Partial<RenderOptionen>): RenderOptionen {
  return { karte, firma: 'Augusta Energy', farbwelt: 'hell', seite: 'vorderseite', beschnitt: 0, modus: 'vorschau', foto, ...teil }
}

/** Grundlinien aller <text>-Elemente (x, y) – nur direkte Attribute, keine Logo-Texte in verschachtelten <svg>. */
function textPositionen(svg: string): Array<[number, number]> {
  const ohneLogos = svg.replace(/<svg [^>]*viewBox="0 0 (470 100|307 245)"[\s\S]*?<\/svg>/g, '')
  return [...ohneLogos.matchAll(/<text x="([\d.-]+)" y="([\d.-]+)"/g)].map((m) => [Number(m[1]), Number(m[2])])
}

describe('renderKarte', () => {
  it('rendert alle Designs in beiden Farbwelten und Seiten ohne NaN/undefined', () => {
    for (const design of DESIGNS) {
      for (const farbwelt of farbwelten) {
        for (const seite of seiten) {
          const svg = renderKarte(design, optionen({ farbwelt, seite }))
          expect(svg.startsWith('<?xml')).toBe(true)
          expect(svg.endsWith('</svg>')).toBe(true)
          expect(svg).not.toContain('NaN')
          expect(svg).not.toContain('undefined')
          expect(svg).toContain(`width="${KARTE.breite}mm"`)
        }
      }
    }
  })

  it('hält den Sicherheitsabstand: jede Text-Grundlinie liegt im Bereich x 5–80, y 5–49.6', () => {
    for (const design of DESIGNS) {
      for (const farbwelt of farbwelten) {
        for (const seite of seiten) {
          for (const modusFoto of [foto, null]) {
            const svg = renderKarte(design, optionen({ farbwelt, seite, foto: modusFoto }))
            for (const [x, y] of textPositionen(svg)) {
              expect(x, `${design.id}/${farbwelt}/${seite} x`).toBeGreaterThanOrEqual(SICHERHEIT)
              expect(x, `${design.id}/${farbwelt}/${seite} x`).toBeLessThanOrEqual(KARTE.breite - SICHERHEIT)
              expect(y, `${design.id}/${farbwelt}/${seite} y`).toBeGreaterThanOrEqual(SICHERHEIT)
              expect(y, `${design.id}/${farbwelt}/${seite} y`).toBeLessThanOrEqual(KARTE.hoehe - SICHERHEIT - 0.4)
            }
          }
        }
      }
    }
  })

  it('referenziert das Foto in der Vorschau per <use> und bettet es im Export ein', () => {
    const vorschau = renderKarte(DESIGNS[0], optionen({}))
    expect(vorschau).toContain('href="#vk-foto"')
    expect(vorschau).not.toContain('data:image/jpeg')
    const exportSvg = renderKarte(DESIGNS[0], optionen({ modus: 'export', schriftenCss: '@font-face{}' }))
    expect(exportSvg).toContain('data:image/jpeg;base64,AAAA')
    expect(exportSvg).toContain('<style>@font-face{}</style>')
  })

  it('zeichnet Hilfslinien und Schnittmarken nur mit Beschnitt', () => {
    const ohne = renderKarte(DESIGNS[0], optionen({ hilfslinien: true, schnittmarken: true }))
    expect(ohne).not.toContain('#e11d48')
    const mit = renderKarte(DESIGNS[0], optionen({ beschnitt: 3, hilfslinien: true, schnittmarken: true }))
    expect(mit).toContain('width="91mm"')
    expect(mit).toContain('#e11d48')
    expect(mit).toContain('#0284c7')
    expect(mit).toContain('#888888')
  })
})
```

- [ ] **Step 14: Test laufen lassen – muss fehlschlagen**

Run: `npx vitest run src/lib/visitenkarten/render.test.ts`
Expected: FAIL (Modul `./render` fehlt)

- [ ] **Step 15: Render implementieren**

`src/lib/visitenkarten/render.ts`:

```ts
import type { Design } from './designs/design'
import { PALETTEN } from './palette'
import { N, Zeichner } from './svg'
import { KARTE, SICHERHEIT, type RenderOptionen } from './typen'

type HuellenOptionen = { b: number; uid: string; schriftenCss?: string; hilfslinien?: boolean; schnittmarken?: boolean }

/** SVG-Dokument um den inneren String: Schriften (Export), Sättigungsfilter, Hilfslinien, Schnittmarken. */
export function svgDokument(inner: string, o: HuellenOptionen): string {
  const b = o.b
  const W = KARTE.breite + 2 * b
  const H = KARTE.hoehe + 2 * b
  const stil = o.schriftenCss ? `<style>${o.schriftenCss}</style>` : ''
  const filter = `<defs><filter id="sat-${o.uid}"><feColorMatrix type="saturate" values="0.5"/></filter></defs>`
  let overlay = ''
  if (o.hilfslinien && b > 0) {
    overlay += `<rect x="${N(b)}" y="${N(b)}" width="${KARTE.breite}" height="${KARTE.hoehe}" fill="none" stroke="#e11d48" stroke-width="0.25" stroke-dasharray="1.6 1.1"/>`
    overlay += `<rect x="${N(b + SICHERHEIT)}" y="${N(b + SICHERHEIT)}" width="${KARTE.breite - 2 * SICHERHEIT}" height="${KARTE.hoehe - 2 * SICHERHEIT}" fill="none" stroke="#0284c7" stroke-width="0.2" stroke-dasharray="1 1"/>`
  }
  if (o.schnittmarken && b > 0) {
    const g = 0.8
    const L = b - g
    const marke = (x1: number, y1: number, x2: number, y2: number) =>
      `<line x1="${N(x1)}" y1="${N(y1)}" x2="${N(x2)}" y2="${N(y2)}" stroke="#888888" stroke-width="0.15"/>`
    const R = b + KARTE.breite
    const U = b + KARTE.hoehe
    overlay +=
      marke(b, 0, b, L) + marke(R, 0, R, L) + marke(b, U + g, b, H) + marke(R, U + g, R, H) +
      marke(0, b, L, b) + marke(0, U, L, U) + marke(R + g, b, W, b) + marke(R + g, U, W, U)
  }
  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${N(W)}mm" height="${N(H)}mm" viewBox="0 0 ${N(W)} ${N(H)}">${stil}${filter}${inner}${overlay}</svg>`
  )
}

export function renderKarte(design: Design, o: RenderOptionen): string {
  const b = o.beschnitt
  const uid = `${design.id}-${o.farbwelt}-${o.seite}-${b}${o.hilfslinien ? 'g' : ''}${o.schnittmarken ? 't' : ''}`
  const z = new Zeichner({ b, uid, p: PALETTEN[o.farbwelt], k: o.karte, firma: o.firma, dunkel: o.farbwelt === 'dunkel', foto: o.foto, modus: o.modus, messer: o.messer })
  const inner = o.seite === 'vorderseite' ? design.vorderseite(z) : design.rueckseite(z)
  return svgDokument(inner, { b, uid, schriftenCss: o.modus === 'export' ? o.schriftenCss : undefined, hilfslinien: o.hilfslinien, schnittmarken: o.schnittmarken })
}
```

- [ ] **Step 16: Test grün**

Run: `npx vitest run src/lib/visitenkarten/render.test.ts`
Expected: PASS (4 Tests)

- [ ] **Step 17: Dateinamen – Test zuerst**

`src/lib/visitenkarten/dateiname.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { dateiBasis, pdfDateiname, pngDateiname, svgDateiname } from './dateiname'

describe('Dateinamen der Visitenkarten', () => {
  const basis = dateiBasis({ nr: '01', titel: 'Klassik' }, 'hell', 'Niklas Trojovsky')

  it('baut die Basis aus Nummer, Titel, Farbwelt und Name', () => {
    expect(basis).toBe('Augusta-Energy_Visitenkarte_01-Klassik_Hell_Niklas-Trojovsky')
    expect(dateiBasis({ nr: '05', titel: 'Kontakt-QR' }, 'dunkel', '  ')).toBe('Augusta-Energy_Visitenkarte_05-Kontakt-QR_Dunkel_Karte')
    expect(dateiBasis({ nr: '04', titel: 'Porträt' }, 'hell', 'Jörg Müßig')).toBe('Augusta-Energy_Visitenkarte_04-Portraet_Hell_Joerg-Muessig')
  })

  it('hängt Seite, dpi, Beschnitt und Endung an', () => {
    expect(svgDateiname(basis, 'vorderseite', false)).toBe(`${basis}_Vorderseite.svg`)
    expect(svgDateiname(basis, 'rueckseite', true)).toBe(`${basis}_Rueckseite_Beschnitt.svg`)
    expect(pngDateiname(basis, 'vorderseite', 300, false)).toBe(`${basis}_Vorderseite_300dpi.png`)
    expect(pngDateiname(basis, 'rueckseite', 600, true)).toBe(`${basis}_Rueckseite_600dpi_Beschnitt.png`)
    expect(pdfDateiname(basis, false)).toBe(`${basis}_Druck.pdf`)
    expect(pdfDateiname(basis, true)).toBe(`${basis}_Druck-verlustfrei.pdf`)
  })
})
```

- [ ] **Step 18: Test laufen lassen – muss fehlschlagen**

Run: `npx vitest run src/lib/visitenkarten/dateiname.test.ts`
Expected: FAIL (Modul `./dateiname` fehlt)

- [ ] **Step 19: Dateinamen implementieren**

`src/lib/visitenkarten/dateiname.ts`:

```ts
import { slug } from '../dateiname'
import type { Farbwelt, Seite } from './typen'

const SEITE: Record<Seite, string> = { vorderseite: 'Vorderseite', rueckseite: 'Rueckseite' }

export function dateiBasis(design: { nr: string; titel: string }, farbwelt: Farbwelt, name: string): string {
  const wer = name.trim() ? slug(name.trim()) : 'Karte'
  return `Augusta-Energy_Visitenkarte_${design.nr}-${slug(design.titel)}_${farbwelt === 'hell' ? 'Hell' : 'Dunkel'}_${wer}`
}

export function svgDateiname(basis: string, seite: Seite, beschnitt: boolean): string {
  return `${basis}_${SEITE[seite]}${beschnitt ? '_Beschnitt' : ''}.svg`
}

export function pngDateiname(basis: string, seite: Seite, dpi: 300 | 600, beschnitt: boolean): string {
  return `${basis}_${SEITE[seite]}_${dpi}dpi${beschnitt ? '_Beschnitt' : ''}.png`
}

export function pdfDateiname(basis: string, verlustfrei: boolean): string {
  return `${basis}_${verlustfrei ? 'Druck-verlustfrei' : 'Druck'}.pdf`
}
```

- [ ] **Step 20: Test grün**

Run: `npx vitest run src/lib/visitenkarten/dateiname.test.ts`
Expected: PASS (2 Tests)

- [ ] **Step 21: Schriften-CSS (Node) und Render-Skript**

`src/brand/fonts.svg.node.ts` (nutzt `schriftenCss` aus dem vorhandenen `src/brand/fonts.svg.ts`):

```ts
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { schriftenCss } from './fonts.svg'

const require = createRequire(import.meta.url)
const dataUrl = (paket: string) => `data:font/woff2;base64,${readFileSync(require.resolve(paket)).toString('base64')}`

/** Schriften-CSS für Node-Skripte (Vite-`?inline`-Importe gibt es dort nicht). */
export const SCHRIFTEN_CSS_NODE = schriftenCss({
  montserrat500: dataUrl('@fontsource/montserrat/files/montserrat-latin-500-normal.woff2'),
  montserrat600: dataUrl('@fontsource/montserrat/files/montserrat-latin-600-normal.woff2'),
  montserrat700: dataUrl('@fontsource/montserrat/files/montserrat-latin-700-normal.woff2'),
  raleway400: dataUrl('@fontsource/raleway/files/raleway-latin-400-normal.woff2'),
  raleway500: dataUrl('@fontsource/raleway/files/raleway-latin-500-normal.woff2'),
  raleway600: dataUrl('@fontsource/raleway/files/raleway-latin-600-normal.woff2'),
})
```

`scripts/render-visitenkarten.ts` (Importe mit expliziten `.ts`-Endungen wie in `scripts/render-beispiele.tsx`):

```ts
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { SCHRIFTEN_CSS_NODE } from '../src/brand/fonts.svg.node.ts'
import { standardAbsender } from '../src/lib/absender.ts'
import { DESIGNS } from '../src/lib/visitenkarten/designs/index.ts'
import { PERSONEN, personKarte } from '../src/lib/visitenkarten/personen.ts'
import { renderKarte } from '../src/lib/visitenkarten/render.ts'
import { BESCHNITT, type Farbwelt, type Foto, type Seite } from '../src/lib/visitenkarten/typen.ts'

/** Schreibt alle 24 Export-SVGs (Beispiel: Niklas mit Foto) und Galerien zur Sichtprüfung nach out/visitenkarten/.
 *  Screenshot: npx playwright@1.56.1 screenshot --browser=chromium --channel=chrome --viewport-size=1500,1100 --full-page "file://$PWD/out/visitenkarten/galerie-01.html" out/visitenkarten/galerie-01.png */
const person = PERSONEN[0]
const fotoDaten = person.foto
if (!fotoDaten) throw new Error('Beispielperson ohne Foto')
const karte = personKarte(person, standardAbsender)
const foto: Foto = {
  src: `data:image/jpeg;base64,${readFileSync(`public/visitenkarten/team/${fotoDaten.datei}`).toString('base64')}`,
  w: fotoDaten.w,
  h: fotoDaten.h,
  crop: fotoDaten.crop,
}
const ziel = 'out/visitenkarten'
mkdirSync(ziel, { recursive: true })
const farbwelten: Farbwelt[] = ['hell', 'dunkel']
const seiten: Seite[] = ['vorderseite', 'rueckseite']

function kachel(titel: string, svg: string): string {
  return `<figure><figcaption>${titel}</figcaption>${svg.replace(/^<\?xml[^>]*>\n?/, '')}</figure>`
}

function galerie(kacheln: string[], spalten: number): string {
  return (
    `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Visitenkarten</title><style>${SCHRIFTEN_CSS_NODE}\n` +
    `body{margin:24px;background:#8d8d8d;font:13px Raleway,sans-serif;color:#fff}.g{display:grid;grid-template-columns:repeat(${spalten},1fr);gap:22px}` +
    `figure{margin:0}figcaption{margin-bottom:6px}svg{width:100%;height:auto;display:block;box-shadow:0 8px 22px rgba(0,0,0,.35)}</style></head>` +
    `<body><div class="g">${kacheln.join('')}</div></body></html>`
  )
}

const alle: string[] = []
const alleHilfslinien: string[] = []
for (const design of DESIGNS) {
  const proDesign: string[] = []
  for (const farbwelt of farbwelten) {
    for (const seite of seiten) {
      const basis = { karte, firma: standardAbsender.firma, farbwelt, seite, modus: 'export' as const, foto }
      const titel = `${design.nr} ${design.titel} · ${farbwelt} · ${seite}`
      writeFileSync(`${ziel}/${design.nr}-${design.id}-${farbwelt}-${seite}.svg`, renderKarte(design, { ...basis, beschnitt: 0, schriftenCss: SCHRIFTEN_CSS_NODE }))
      const ohne = kachel(titel, renderKarte(design, { ...basis, beschnitt: 0 }))
      alle.push(ohne)
      proDesign.push(ohne)
      alleHilfslinien.push(kachel(`${titel} · Hilfslinien`, renderKarte(design, { ...basis, beschnitt: BESCHNITT, hilfslinien: true })))
    }
  }
  writeFileSync(`${ziel}/galerie-${design.nr}.html`, galerie(proDesign, 2))
}
writeFileSync(`${ziel}/galerie.html`, galerie(alle, 4))
writeFileSync(`${ziel}/galerie-hilfslinien.html`, galerie(alleHilfslinien, 4))
console.log(`${ziel}: ${DESIGNS.length * 4} SVGs, galerie.html, galerie-hilfslinien.html, galerie-01…06.html`)
```

`package.json` – Skript ergänzen:

```json
"render:visitenkarten": "tsx --tsconfig tsconfig.app.json scripts/render-visitenkarten.ts"
```

- [ ] **Step 22: Skript ausführen und Galerie prüfen**

Run: `npm run render:visitenkarten && npx playwright@1.56.1 screenshot --browser=chromium --channel=chrome --viewport-size=1500,1100 --full-page "file://$PWD/out/visitenkarten/galerie-01.html" out/visitenkarten/galerie-01.png`
Expected: 24 SVG-Dateien und Galerien in `out/visitenkarten/`; das PNG zeigt vier Platzhalterkarten (Name in Montserrat, Foto rund, Logo auf der Rückseite). Das PNG mit dem Read-Tool ansehen: Schriften müssen Montserrat/Raleway sein (kein Fallback-Arial), Foto sichtbar mit Goldring.

- [ ] **Step 23: Lint, alle Tests, Build, Commit**

Run: `npm run lint && npm test && npm run build`
Expected: alles grün (bestehende 69 Tests + 11 neue).

```bash
git add src/lib/visitenkarten src/brand/fonts.svg.ts src/brand/fonts.svg.node.ts scripts/render-visitenkarten.ts package.json
git commit -m "feat(visitenkarten): Render-Engine, Paletten, vCard/QR, Registry mit Platzhaltern, Render-Skript"
```

---

### Task 2: Exporte – Raster-PDF-Writer, PNG/SVG/PDF-Download, Druckansicht, Browser-Schriften-CSS

**Files:**
- Create: `src/lib/visitenkarten/pdfRaster.ts`, `src/lib/visitenkarten/pdfRaster.test.ts`, `src/ui/visitenkarten/exporte.ts`, `src/ui/visitenkarten/druckansicht.ts`, `src/brand/fonts.svg.browser.ts`

**Interfaces:**
- Consumes: `typen.ts` (`KARTE`, `BESCHNITT`, `Seite`), `src/brand/fonts.svg.ts` (`schriftenCss`, vorhanden auf `main`). Nichts aus Task 1 – die Dateien dieses Tasks kennen die Engine nur über den Callback-Typ `SvgErzeuger`.
- Produces: `SvgErzeuger`, `downloadBlob`, `rastern`, `exportiereSvg`, `exportierePng`, `exportierePdf`, `oeffneDruckansicht`, `SCHRIFTEN_CSS`, `baueRasterPdf`, `jpegBytesVonCanvas`, `flateBytesVonCanvas`.

- [ ] **Step 1: PDF-Writer – Test zuerst**

`src/lib/visitenkarten/pdfRaster.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { baueRasterPdf } from './pdfRaster'

const dec = new TextDecoder('latin1')

describe('baueRasterPdf', () => {
  it('schreibt ein PDF 1.4 mit zwei Bildseiten, gültiger xref-Tabelle und Trim-Box', () => {
    const pdf = baueRasterPdf(
      [
        { bytes: new Uint8Array([1, 2, 3]), w: 2, h: 1, filter: 'DCTDecode' },
        { bytes: new Uint8Array([4, 5]), w: 1, h: 1, filter: 'FlateDecode' },
      ],
      91,
      61,
      3,
    )
    const text = dec.decode(pdf)
    expect(text.startsWith('%PDF-1.4\n')).toBe(true)
    expect(text.endsWith('%%EOF\n')).toBe(true)
    expect(text).toContain('/MediaBox [0 0 257.95 172.91]')
    expect(text).toContain('/BleedBox [0 0 257.95 172.91]')
    expect(text).toContain('/TrimBox [8.50 8.50 249.45 164.41]')
    expect(text).toContain('/Count 2')
    expect(text).toContain('/Filter /DCTDecode /Length 3')
    expect(text).toContain('/Filter /FlateDecode /Length 2')

    const xrefStart = Number(text.match(/startxref\n(\d+)\n/)?.[1])
    expect(dec.decode(pdf.slice(xrefStart, xrefStart + 4))).toBe('xref')
    const eintraege = [...dec.decode(pdf.slice(xrefStart)).matchAll(/(\d{10}) 00000 n/g)].map((m) => Number(m[1]))
    expect(eintraege).toHaveLength(8) // Catalog, Pages, 2 × (Page, Contents, Image)
    eintraege.forEach((offset, i) => {
      expect(dec.decode(pdf.slice(offset, offset + 12)).startsWith(`${i + 1} 0 obj`)).toBe(true)
    })
  })
})
```

- [ ] **Step 2: Test laufen lassen – muss fehlschlagen**

Run: `npx vitest run src/lib/visitenkarten/pdfRaster.test.ts`
Expected: FAIL (Modul `./pdfRaster` fehlt)

- [ ] **Step 3: PDF-Writer implementieren**

`src/lib/visitenkarten/pdfRaster.ts`:

```ts
/** Minimaler PDF-Writer: je Seite ein Bild (JPEG = DCTDecode, rohes RGB = FlateDecode), MediaBox = BleedBox,
 *  TrimBox um den Beschnitt eingerückt. Port des SAFE-G-Vorbilds; genügt Online-Druckereien. */
export type PdfSeite = { bytes: Uint8Array; w: number; h: number; filter: 'DCTDecode' | 'FlateDecode' }

export function baueRasterPdf(seiten: PdfSeite[], breiteMm: number, hoeheMm: number, beschnittMm: number): Uint8Array<ArrayBuffer> {
  const PT = 72 / 25.4
  const W = breiteMm * PT
  const H = hoeheMm * PT
  const T = beschnittMm * PT
  const fx = (v: number) => v.toFixed(2)
  const enc = new TextEncoder()
  const teile: Uint8Array[] = []
  let offset = 0
  const offsets: number[] = []
  const push = (u8: Uint8Array) => {
    teile.push(u8)
    offset += u8.length
  }
  const pushStr = (s: string) => push(enc.encode(s))
  const beginObj = (n: number) => {
    offsets[n] = offset
    pushStr(`${n} 0 obj\n`)
  }

  // %PDF-1.4 + Binärkommentar, damit Transportwege die Datei als binär behandeln
  push(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]))

  const seitenObj = seiten.map((_, i) => 3 + i * 3)
  beginObj(1)
  pushStr('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n')
  beginObj(2)
  pushStr(`<< /Type /Pages /Kids [${seitenObj.map((n) => `${n} 0 R`).join(' ')}] /Count ${seiten.length} >>\nendobj\n`)

  seiten.forEach((seite, i) => {
    const nSeite = 3 + i * 3
    const nInhalt = nSeite + 1
    const nBild = nSeite + 2
    beginObj(nSeite)
    pushStr(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${fx(W)} ${fx(H)}] ` +
        `/BleedBox [0 0 ${fx(W)} ${fx(H)}] /TrimBox [${fx(T)} ${fx(T)} ${fx(W - T)} ${fx(H - T)}] ` +
        `/Resources << /XObject << /Im${i} ${nBild} 0 R >> >> /Contents ${nInhalt} 0 R >>\nendobj\n`,
    )
    const inhalt = `q ${fx(W)} 0 0 ${fx(H)} 0 0 cm /Im${i} Do Q\n`
    beginObj(nInhalt)
    pushStr(`<< /Length ${inhalt.length} >>\nstream\n${inhalt}endstream\nendobj\n`)
    beginObj(nBild)
    pushStr(
      `<< /Type /XObject /Subtype /Image /Width ${seite.w} /Height ${seite.h} ` +
        `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /${seite.filter} /Length ${seite.bytes.length} >>\nstream\n`,
    )
    push(seite.bytes)
    pushStr('\nendstream\nendobj\n')
  })

  const maxObj = 2 + seiten.length * 3
  const xrefStart = offset
  let xref = `xref\n0 ${maxObj + 1}\n0000000000 65535 f \n`
  for (let n = 1; n <= maxObj; n++) xref += String(offsets[n]).padStart(10, '0') + ' 00000 n \n'
  pushStr(xref)
  pushStr(`trailer\n<< /Size ${maxObj + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`)

  const gesamt = new Uint8Array(offset)
  let pos = 0
  for (const t of teile) {
    gesamt.set(t, pos)
    pos += t.length
  }
  return gesamt
}

/** JPEG-Bytes des Canvas (DCTDecode). */
export function jpegBytesVonCanvas(canvas: HTMLCanvasElement, qualitaet: number): Uint8Array<ArrayBuffer> {
  const dataUrl = canvas.toDataURL('image/jpeg', qualitaet)
  const bin = atob(dataUrl.slice(dataUrl.indexOf(',') + 1))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}

/** Rohes RGB des Canvas, zlib-komprimiert (FlateDecode) – verlustfrei. */
export async function flateBytesVonCanvas(canvas: HTMLCanvasElement): Promise<Uint8Array<ArrayBuffer>> {
  if (typeof CompressionStream === 'undefined') {
    throw new Error('Dieser Browser unterstützt keine verlustfreie Kompression (CompressionStream) – bitte das 600-dpi-PDF nutzen.')
  }
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas nicht verfügbar')
  const daten = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const rgb = new Uint8Array(canvas.width * canvas.height * 3)
  for (let i = 0, j = 0; i < daten.length; i += 4) {
    rgb[j++] = daten[i]
    rgb[j++] = daten[i + 1]
    rgb[j++] = daten[i + 2]
  }
  const strom = new Blob([rgb]).stream().pipeThrough(new CompressionStream('deflate'))
  return new Uint8Array(await new Response(strom).arrayBuffer())
}
```

- [ ] **Step 4: Test grün**

Run: `npx vitest run src/lib/visitenkarten/pdfRaster.test.ts`
Expected: PASS (1 Test)

- [ ] **Step 5: Browser-Schriften-CSS, Exporte, Druckansicht**

`src/brand/fonts.svg.browser.ts` (Vite `?inline` liefert `data:font/woff2;base64,…`):

```ts
import montserrat500 from '@fontsource/montserrat/files/montserrat-latin-500-normal.woff2?inline'
import montserrat600 from '@fontsource/montserrat/files/montserrat-latin-600-normal.woff2?inline'
import montserrat700 from '@fontsource/montserrat/files/montserrat-latin-700-normal.woff2?inline'
import raleway400 from '@fontsource/raleway/files/raleway-latin-400-normal.woff2?inline'
import raleway500 from '@fontsource/raleway/files/raleway-latin-500-normal.woff2?inline'
import raleway600 from '@fontsource/raleway/files/raleway-latin-600-normal.woff2?inline'
import { schriftenCss } from './fonts.svg'

/** Schriften-CSS für Export-SVGs und Druckansicht (im Bundle eingebettet, ≈180 KB). */
export const SCHRIFTEN_CSS = schriftenCss({ montserrat500, montserrat600, montserrat700, raleway400, raleway500, raleway600 })
```

`src/ui/visitenkarten/exporte.ts`:

```ts
import { baueRasterPdf, flateBytesVonCanvas, jpegBytesVonCanvas, type PdfSeite } from '../../lib/visitenkarten/pdfRaster'
import { BESCHNITT, KARTE, type Seite } from '../../lib/visitenkarten/typen'

/** Liefert das Export-SVG einer Seite (Schriften und Foto eingebettet). Der Workspace baut den Erzeuger aus renderKarte. */
export type SvgErzeuger = (seite: Seite, o: { beschnitt: number; schnittmarken?: boolean }) => string

export function downloadBlob(name: string, blob: Blob): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 4000)
}

function ladeSvgBild(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
    const bild = new Image()
    bild.onload = () => {
      URL.revokeObjectURL(url)
      resolve(bild)
    }
    bild.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('SVG konnte nicht gerastert werden'))
    }
    bild.src = url
  })
}

/** Rastert eine Seite auf round(mm / 25.4 × dpi) Pixel (300 dpi: 1004 × 650, 600 dpi: 2008 × 1299, mit Beschnitt 2150 × 1441). */
export async function rastern(erzeuge: SvgErzeuger, seite: Seite, dpi: number, beschnitt: number): Promise<HTMLCanvasElement> {
  const wMm = KARTE.breite + 2 * beschnitt
  const hMm = KARTE.hoehe + 2 * beschnitt
  const wPx = Math.round((wMm / 25.4) * dpi)
  const hPx = Math.round((hMm / 25.4) * dpi)
  const bild = await ladeSvgBild(erzeuge(seite, { beschnitt }))
  const canvas = document.createElement('canvas')
  canvas.width = wPx
  canvas.height = hPx
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas nicht verfügbar')
  ctx.drawImage(bild, 0, 0, wPx, hPx)
  return canvas
}

export function exportiereSvg(erzeuge: SvgErzeuger, seite: Seite, beschnitt: number, dateiname: string): void {
  downloadBlob(dateiname, new Blob([erzeuge(seite, { beschnitt })], { type: 'image/svg+xml;charset=utf-8' }))
}

export async function exportierePng(erzeuge: SvgErzeuger, seite: Seite, dpi: 300 | 600, beschnitt: number, dateiname: string): Promise<void> {
  const canvas = await rastern(erzeuge, seite, dpi, beschnitt)
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'))
  if (!blob) throw new Error('PNG-Kodierung fehlgeschlagen')
  downloadBlob(dateiname, blob)
}

/** Vorder- und Rückseite mit 3 mm Beschnitt bei 600 dpi: JPEG (Qualität 0.93) oder verlustfrei (Flate). */
export async function exportierePdf(erzeuge: SvgErzeuger, verlustfrei: boolean, dateiname: string): Promise<void> {
  const seiten: PdfSeite[] = []
  for (const seite of ['vorderseite', 'rueckseite'] as const) {
    const canvas = await rastern(erzeuge, seite, 600, BESCHNITT)
    seiten.push(
      verlustfrei
        ? { bytes: await flateBytesVonCanvas(canvas), w: canvas.width, h: canvas.height, filter: 'FlateDecode' }
        : { bytes: jpegBytesVonCanvas(canvas, 0.93), w: canvas.width, h: canvas.height, filter: 'DCTDecode' },
    )
  }
  const pdf = baueRasterPdf(seiten, KARTE.breite + 2 * BESCHNITT, KARTE.hoehe + 2 * BESCHNITT, BESCHNITT)
  downloadBlob(dateiname, new Blob([pdf], { type: 'application/pdf' }))
}
```

`src/ui/visitenkarten/druckansicht.ts`:

```ts
import { BESCHNITT, KARTE } from '../../lib/visitenkarten/typen'
import type { SvgErzeuger } from './exporte'

const escHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Beide Seiten in exakter physischer Größe in einem neuen Fenster; im Druckdialog „Als PDF sichern“ ergibt echte Vektoren.
 *  Die Export-SVGs bringen ihre Schriften selbst mit; Schnittmarken zeigen die Schnittkante. */
export function oeffneDruckansicht(erzeuge: SvgErzeuger, titel: string): void {
  const W = KARTE.breite + 2 * BESCHNITT
  const H = KARTE.hoehe + 2 * BESCHNITT
  const seite = (svg: string) => `<div class="pg">${svg.replace(/^<\?xml[^>]*>\n?/, '')}</div>`
  const vorne = erzeuge('vorderseite', { beschnitt: BESCHNITT, schnittmarken: true })
  const hinten = erzeuge('rueckseite', { beschnitt: BESCHNITT, schnittmarken: true })
  const fenster = window.open('', '_blank')
  if (!fenster) throw new Error('Pop-up wurde blockiert – bitte Pop-ups für diese Seite erlauben.')
  fenster.document.write(
    `<!DOCTYPE html><html lang="de"><head><meta charset="utf-8"><title>${escHtml(titel)}</title>` +
      `<style>@page{size:${W}mm ${H}mm;margin:0}html,body{margin:0;padding:0}` +
      `.pg{width:${W}mm;height:${H}mm;page-break-after:always;break-after:page;overflow:hidden}` +
      `.pg:last-child{page-break-after:auto;break-after:auto}.pg svg{display:block;width:${W}mm;height:${H}mm}</style></head>` +
      `<body>${seite(vorne)}${seite(hinten)}` +
      `<script>window.addEventListener("load",function(){var f=document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve();f.then(function(){setTimeout(function(){window.print()},250)})})<\/script>` +
      `</body></html>`,
  )
  fenster.document.close()
}
```

- [ ] **Step 6: Lint, Tests, Build, Commit**

Run: `npm run lint && npm test && npm run build`
Expected: grün. (Der Build bestätigt, dass `?inline` typisiert ist und die Fonts eingebettet werden.)

```bash
git add src/lib/visitenkarten/pdfRaster.ts src/lib/visitenkarten/pdfRaster.test.ts src/ui/visitenkarten src/brand/fonts.svg.browser.ts
git commit -m "feat(visitenkarten): Raster-PDF-Writer, SVG/PNG/PDF-Exporte, Druckansicht, eingebettete Export-Schriften"
```

---

### Task 3: Oberfläche des Tabs (Kartendetails, Design-Abschnitte, Vorschau, Hinweise, Workspace)

**Files:**
- Create: `src/ui/visitenkarten/fotoLaden.ts`, `src/ui/visitenkarten/KartenPanel.tsx`, `src/ui/visitenkarten/KartenVorschau.tsx`, `src/ui/visitenkarten/DesignSektion.tsx`, `src/ui/visitenkarten/DruckHinweise.tsx`, `src/ui/visitenkarten/VisitenkartenWorkspace.tsx`

**Interfaces:**
- Consumes (Task 1): `renderKarte`, `DESIGNS`, `Design`, `PERSONEN`, `findePerson`, `personKarte`, `webUrl`, `whatsappUrl`, `canvasMesser`, `dateiBasis`, `svgDateiname`, `pngDateiname`, `pdfDateiname`, `INSTAGRAM_URL`; (Task 2): `SvgErzeuger`, `exportiereSvg`, `exportierePng`, `exportierePdf`, `oeffneDruckansicht`, `SCHRIFTEN_CSS`; vorhanden: `useLocalStorageState`, `useDebouncedValue`, `Button`, `Field`, `TextInput`, `Toggle`, `Absender`.
- Produces: `VisitenkartenWorkspace({ absender })`, `VISITENKARTE_KEY`.

Keine Unit-Tests für diese Dateien (Spec §9); die Prüfung ist die Sichtprüfung in Step 7.

- [ ] **Step 1: Foto laden**

`src/ui/visitenkarten/fotoLaden.ts`:

```ts
import type { Foto, Person } from '../../lib/visitenkarten/typen'

export function teamFotoUrl(datei: string): string {
  return `${import.meta.env.BASE_URL}visitenkarten/team/${datei}`
}

export function blobAlsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const leser = new FileReader()
    leser.onload = () => resolve(String(leser.result))
    leser.onerror = () => reject(new Error('Datei konnte nicht gelesen werden'))
    leser.readAsDataURL(blob)
  })
}

/** Team-Foto aus public/visitenkarten/team/ als data-URL mit dem hinterlegten Gesichtsausschnitt. */
export async function ladeTeamFoto(p: Person): Promise<Foto | null> {
  if (!p.foto) return null
  const antwort = await fetch(teamFotoUrl(p.foto.datei))
  if (!antwort.ok) throw new Error(`Foto konnte nicht geladen werden (${antwort.status})`)
  const src = await blobAlsDataUrl(await antwort.blob())
  return { src, w: p.foto.w, h: p.foto.h, crop: p.foto.crop }
}

/** Eigenes Bild: mittiger quadratischer Ausschnitt. */
export async function ladeEigenesFoto(datei: File): Promise<Foto> {
  const src = await blobAlsDataUrl(datei)
  const bild = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = () => reject(new Error('Bild konnte nicht gelesen werden'))
    i.src = src
  })
  const s = Math.min(bild.naturalWidth, bild.naturalHeight)
  return { src, w: bild.naturalWidth, h: bild.naturalHeight, crop: { x: (bild.naturalWidth - s) / 2, y: (bild.naturalHeight - s) / 2, s } }
}
```

- [ ] **Step 2: Kartendetails-Panel**

`src/ui/visitenkarten/KartenPanel.tsx`:

```tsx
import { useId, type ChangeEvent } from 'react'
import { PERSONEN, webUrl, whatsappUrl } from '../../lib/visitenkarten/personen'
import { INSTAGRAM_URL } from '../../lib/visitenkarten/texte'
import type { FarbweltWahl, Karte, VisitenkartenZustand } from '../../lib/visitenkarten/typen'
import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { TextInput, Toggle } from '../components/Inputs'

type Props = {
  zustand: VisitenkartenZustand
  hatFoto: boolean
  fotoFehler: string | null
  onPerson: (id: string) => void
  onKarte: (karte: Karte) => void
  onOption: <K extends keyof VisitenkartenZustand>(schluessel: K, wert: VisitenkartenZustand[K]) => void
  onEigenesFoto: (datei: File) => void
}

const FELDER: Array<{ key: keyof Karte; label: string; type?: 'text' | 'email' | 'tel'; hinweis?: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'rolle', label: 'Rolle / Titel' },
  { key: 'telefon', label: 'Telefon', type: 'tel' },
  { key: 'email', label: 'E-Mail', type: 'email' },
  { key: 'web', label: 'Website' },
  { key: 'adresse', label: 'Adresse', hinweis: 'Leer = ausblenden. Format „Straße · PLZ Ort“ für den vCard-QR.' },
]

const FARBWELTEN: Array<{ wert: FarbweltWahl; label: string }> = [
  { wert: 'hell', label: 'Hell' },
  { wert: 'dunkel', label: 'Dunkel' },
  { wert: 'beide', label: 'Beide' },
]

function Segment<T extends string>({ label, wert, optionen, onChange }: { label: string; wert: T | null; optionen: Array<{ wert: T; label: string }>; onChange: (wert: T) => void }) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap border border-ink">
      {optionen.map((o) => {
        const aktiv = o.wert === wert
        return (
          <button
            key={o.wert}
            type="button"
            aria-pressed={aktiv}
            onClick={() => onChange(o.wert)}
            className={`eyebrow px-4 py-2.5 text-[0.66rem] transition-colors ${aktiv ? 'bg-ink text-gold' : 'text-ink hover:bg-cream'}`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function KartenPanel({ zustand, hatFoto, fotoFehler, onPerson, onKarte, onOption, onEigenesFoto }: Props) {
  const id = useId()
  const k = zustand.karte
  const setFeld = (key: keyof Karte, wert: string) => onKarte({ ...k, [key]: wert })
  const onDatei = (e: ChangeEvent<HTMLInputElement>) => {
    const datei = e.target.files?.[0]
    if (datei) onEigenesFoto(datei)
    e.target.value = ''
  }

  return (
    <section className="border border-line bg-cream/40 p-5 md:p-6">
      <h2 className="eyebrow text-gold-deep">Kartendetails</h2>
      <p className="mt-2 max-w-prose text-sm text-ink-600">
        Person wählen oder Daten frei eintragen – alle Vorschauen und QR-Codes folgen sofort. Telefon, E-Mail und Adresse der Voreinstellungen kommen aus „Absender“.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
        <Segment label="Person wählen" wert={zustand.personId} optionen={PERSONEN.map((p) => ({ wert: p.id, label: p.kurz }))} onChange={onPerson} />
        <Segment label="Farbwelt" wert={zustand.farbwelt} optionen={FARBWELTEN} onChange={(w) => onOption('farbwelt', w)} />
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FELDER.map((f) => (
          <Field key={f.key} label={f.label} htmlFor={`${id}-${f.key}`} hinweis={f.hinweis}>
            <TextInput id={`${id}-${f.key}`} type={f.type} value={k[f.key]} onChange={(w) => setFeld(f.key, w)} />
          </Field>
        ))}
        <Field label="QR-Link (Rückseite Design 05)" htmlFor={`${id}-qrLink`}>
          <TextInput id={`${id}-qrLink`} value={k.qrLink} onChange={(w) => setFeld('qrLink', w)} />
          <div className="mt-1 flex flex-wrap gap-1">
            <Button variante="text" klein onClick={() => setFeld('qrLink', webUrl(k.web))}>Website</Button>
            <Button variante="text" klein onClick={() => setFeld('qrLink', whatsappUrl(k.telefon))}>WhatsApp</Button>
            <Button variante="text" klein onClick={() => setFeld('qrLink', INSTAGRAM_URL)}>Instagram</Button>
          </div>
        </Field>
      </div>
      <div className="mt-5 flex flex-wrap items-start gap-x-8 gap-y-3">
        <Toggle id={`${id}-foto`} checked={zustand.fotoAnzeigen && hatFoto} onChange={(w) => onOption('fotoAnzeigen', w)} label="Foto anzeigen" hinweis={hatFoto ? undefined : 'Für diese Karte liegt kein Foto vor.'} />
        <label className="btn btn-outline btn-sm cursor-pointer">
          <input type="file" accept="image/*" className="sr-only" onChange={onDatei} />
          Eigenes Foto …
        </label>
        <Toggle id={`${id}-hilfslinien`} checked={zustand.hilfslinien} onChange={(w) => onOption('hilfslinien', w)} label="Schnittkante & Sicherheitsbereich anzeigen" hinweis="Rot = Schnittkante, Blau = Sicherheitsbereich (5 mm)" />
        <Toggle id={`${id}-beschnitt`} checked={zustand.beschnittExport} onChange={(w) => onOption('beschnittExport', w)} label="SVG/PNG mit 3 mm Beschnitt exportieren" />
      </div>
      {fotoFehler ? <p role="alert" className="mt-3 text-sm text-red-800">{fotoFehler}</p> : null}
    </section>
  )
}
```

- [ ] **Step 3: Vorschau und Design-Abschnitt**

`src/ui/visitenkarten/KartenVorschau.tsx`:

```tsx
/** Inline-SVG einer Kartenseite, auf Spaltenbreite skaliert, mit Kartenschatten. */
export function KartenVorschau({ svg, beschriftung }: { svg: string; beschriftung: string }) {
  return (
    <figure>
      <figcaption className="eyebrow mb-2 flex justify-between text-[0.62rem] text-muted">
        <span>{beschriftung}</span>
        <span>85 × 55 mm</span>
      </figcaption>
      <div
        className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full [&>svg]:shadow-[0_14px_34px_rgba(17,19,21,0.18),0_2px_6px_rgba(17,19,21,0.12)]"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </figure>
  )
}
```

`src/ui/visitenkarten/DesignSektion.tsx`:

```tsx
import { useState } from 'react'
import type { Design } from '../../lib/visitenkarten/designs'
import type { Farbwelt, Seite } from '../../lib/visitenkarten/typen'
import { Button } from '../components/Button'
import { KartenVorschau } from './KartenVorschau'

export type ExportAktion = { art: 'svg' | 'png300' | 'png600'; seite: Seite } | { art: 'pdf' | 'pdfVerlustfrei' | 'drucken' }

type Props = {
  design: Design
  farbwelten: readonly Farbwelt[]
  svg: (farbwelt: Farbwelt, seite: Seite) => string
  onExport: (farbwelt: Farbwelt, aktion: ExportAktion) => Promise<void>
}

const SEITEN: Array<{ wert: Seite; label: string }> = [
  { wert: 'vorderseite', label: 'Vorderseite' },
  { wert: 'rueckseite', label: 'Rückseite' },
]

export function DesignSektion({ design, farbwelten, svg, onExport }: Props) {
  const [laufend, setLaufend] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  const starte = async (farbwelt: Farbwelt, aktion: ExportAktion) => {
    setLaufend(true)
    setFehler(null)
    try {
      await onExport(farbwelt, aktion)
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaufend(false)
    }
  }

  return (
    <section className="border-t border-line pb-6 pt-8">
      <div className="flex flex-wrap items-baseline gap-4">
        <span className="eyebrow text-gold-deep">Design {design.nr}</span>
        <h2 className="display text-2xl">{design.titel}</h2>
      </div>
      <p className="mt-2 max-w-prose text-sm text-ink-600">{design.beschreibung}</p>
      {farbwelten.map((farbwelt) => (
        <div key={farbwelt} className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="eyebrow text-muted">{farbwelt === 'hell' ? 'Hell' : 'Dunkel'}</span>
            <div className="flex flex-wrap gap-2">
              <Button variante="gold" klein disabled={laufend} onClick={() => starte(farbwelt, { art: 'pdf' })}>Druck-PDF 600 dpi</Button>
              <Button variante="gold" klein disabled={laufend} onClick={() => starte(farbwelt, { art: 'pdfVerlustfrei' })}>Druck-PDF verlustfrei</Button>
              <Button variante="outline" klein disabled={laufend} onClick={() => starte(farbwelt, { art: 'drucken' })}>Drucken → Vektor-PDF</Button>
            </div>
          </div>
          <div className="mt-3 grid gap-6 md:grid-cols-2">
            {SEITEN.map((seite) => (
              <div key={seite.wert}>
                <KartenVorschau svg={svg(farbwelt, seite.wert)} beschriftung={seite.label} />
                <div className="mt-1 flex flex-wrap gap-1">
                  <Button variante="text" klein disabled={laufend} onClick={() => starte(farbwelt, { art: 'svg', seite: seite.wert })}>SVG</Button>
                  <Button variante="text" klein disabled={laufend} onClick={() => starte(farbwelt, { art: 'png300', seite: seite.wert })}>PNG 300 dpi</Button>
                  <Button variante="text" klein disabled={laufend} onClick={() => starte(farbwelt, { art: 'png600', seite: seite.wert })}>PNG 600 dpi</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {fehler ? (
        <p role="alert" className="mt-4 border border-red-700 bg-red-50 p-3 text-sm text-red-800">Export fehlgeschlagen: {fehler}</p>
      ) : null}
    </section>
  )
}
```

- [ ] **Step 4: Druckdaten & Hinweise**

`src/ui/visitenkarten/DruckHinweise.tsx`:

```tsx
const HINWEISE: Array<{ titel: string; text: string }> = [
  { titel: 'Endformat', text: '85 × 55 mm quer (Standard-Visitenkarte). Alle Layouts halten 5 mm Sicherheitsabstand zur Schnittkante – mit dem Schalter „Schnittkante & Sicherheitsbereich“ prüfbar.' },
  { titel: 'Druck-PDF', text: '91 × 61 mm inkl. 3 mm Beschnitt umlaufend, mit gesetzter Trim-Box. Seite 1 = Vorderseite, Seite 2 = Rückseite, gerastert mit 600 dpi (sRGB). „Verlustfrei“ bettet die Seiten unkomprimiert ein (größere Datei, keine JPEG-Artefakte).' },
  { titel: 'Drucken → Vektor-PDF', text: 'Öffnet beide Seiten in exakter physischer Größe im Druckdialog – dort „Als PDF sichern“ wählen. Text bleibt echter Vektor; Schnittmarken in den Ecken zeigen die Schnittkante.' },
  { titel: 'PNG 300 / 600 dpi', text: '300 dpi (1004 × 650 px) genügt für Online-Druckereien wie Flyeralarm, Vistaprint oder WIRmachenDRUCK; 600 dpi (2008 × 1299 px) für höchste Rasterqualität. Mit aktiviertem Beschnitt-Export „mit Beschnitt“ hochladen.' },
  { titel: 'SVG', text: 'Vektorquelle mit eingebetteten Schriften – beliebig skalierbar, editierbar in Illustrator, Inkscape oder Affinity. Für Profi-Druckereien oder Weiterbearbeitung.' },
  { titel: 'QR-Codes', text: 'Werden live aus den Kartendetails erzeugt (vCard mit Name, Rolle, Nummer, E-Mail, Adresse; Fehlerkorrektur M). Der QR-Link steuert den Code auf der Rückseite von Design 05 – Website, WhatsApp oder Instagram per Klick.' },
  { titel: 'Fotos', text: 'Team-Fotos der Website werden als runder Ausschnitt mit Goldring gesetzt, wie auf augusta-energy.de leicht entsättigt. „Eigenes Foto“ lädt ein beliebiges Bild (mittiger quadratischer Ausschnitt); das Foto lässt sich pro Export abschalten.' },
  { titel: 'Papierempfehlung', text: '350 g/m² Naturpapier oder Bilderdruck matt, gern mit Soft-Touch-Folie. Für die dunklen Karten lohnt Goldfolie oder partieller UV-Lack auf Marke und Goldlinien.' },
  { titel: 'Schriften', text: 'Montserrat und Raleway – identisch zur Website. In allen Exporten eingebettet; das Werkzeug läuft komplett im Browser.' },
]

export function DruckHinweise() {
  return (
    <section className="mt-6 border border-line bg-cream/40 p-5 md:p-6">
      <h2 className="eyebrow text-gold-deep">Druckdaten &amp; Hinweise</h2>
      <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {HINWEISE.map((h) => (
          <div key={h.titel}>
            <dt className="eyebrow text-[0.62rem] text-ink-600">{h.titel}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-ink-600">{h.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
```

- [ ] **Step 5: Workspace**

`src/ui/visitenkarten/VisitenkartenWorkspace.tsx`:

```tsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SCHRIFTEN_CSS } from '../../brand/fonts.svg.browser'
import type { Absender } from '../../lib/absender'
import { useLocalStorageState } from '../../lib/storage'
import { dateiBasis, pdfDateiname, pngDateiname, svgDateiname } from '../../lib/visitenkarten/dateiname'
import { DESIGNS, type Design } from '../../lib/visitenkarten/designs'
import { findePerson, PERSONEN, personKarte } from '../../lib/visitenkarten/personen'
import { renderKarte } from '../../lib/visitenkarten/render'
import { canvasMesser } from '../../lib/visitenkarten/textbreite'
import { BESCHNITT, FOTO_ID, type Farbwelt, type Foto, type Karte, type Messer, type Seite, type VisitenkartenZustand } from '../../lib/visitenkarten/typen'
import { useDebouncedValue } from '../useDebouncedValue'
import { DesignSektion, type ExportAktion } from './DesignSektion'
import { oeffneDruckansicht } from './druckansicht'
import { DruckHinweise } from './DruckHinweise'
import { exportierePdf, exportierePng, exportiereSvg, type SvgErzeuger } from './exporte'
import { ladeEigenesFoto, ladeTeamFoto } from './fotoLaden'
import { KartenPanel } from './KartenPanel'

export const VISITENKARTE_KEY = 'augusta-dokumente:v1:visitenkarte'
const ALLE_FARBWELTEN: readonly Farbwelt[] = ['hell', 'dunkel']
const SEITEN: readonly Seite[] = ['vorderseite', 'rueckseite']

function startZustand(absender: Absender): VisitenkartenZustand {
  return { personId: PERSONEN[0].id, karte: personKarte(PERSONEN[0], absender), fotoAnzeigen: true, hilfslinien: false, beschnittExport: false, farbwelt: 'beide' }
}

function fehlertext(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

export function VisitenkartenWorkspace({ absender }: { absender: Absender }) {
  const [start] = useState(() => startZustand(absender))
  const [zustand, setZustand] = useLocalStorageState<VisitenkartenZustand>(VISITENKARTE_KEY, start)
  const [foto, setFoto] = useState<Foto | null>(null)
  const [fotoQuelle, setFotoQuelle] = useState<'person' | 'eigen'>('person')
  const [fotoFehler, setFotoFehler] = useState<string | null>(null)
  const [messer, setMesser] = useState<Messer | undefined>(undefined)

  // Echte Textbreiten (für die textLength-Stauchung), sobald die Webfonts da sind
  useEffect(() => {
    let aktiv = true
    const bereit = typeof document !== 'undefined' && document.fonts ? document.fonts.ready : Promise.resolve()
    bereit.then(
      () => {
        if (aktiv) setMesser(() => canvasMesser() ?? undefined)
      },
      () => {},
    )
    return () => {
      aktiv = false
    }
  }, [])

  const ladePerson = useCallback(
    (id: string) => {
      const p = findePerson(id)
      if (!p) return
      setZustand((z) => ({ ...z, personId: p.id, karte: personKarte(p, absender) }))
      setFotoQuelle('person')
    },
    [absender, setZustand],
  )

  // Deep-Link ?person=<id> gewinnt beim ersten Rendern gegen den gespeicherten Zustand
  const deepLinkGeprueft = useRef(false)
  useEffect(() => {
    if (deepLinkGeprueft.current) return
    deepLinkGeprueft.current = true
    const id = new URLSearchParams(window.location.search).get('person')
    if (id) ladePerson(id)
  }, [ladePerson])

  // Team-Foto der gewählten Person laden; frei editierte Karten (personId null) behalten das Foto
  useEffect(() => {
    if (fotoQuelle !== 'person') return
    const p = findePerson(zustand.personId)
    if (!p) return
    if (!p.foto) {
      setFoto(null)
      return
    }
    let aktiv = true
    setFotoFehler(null)
    ladeTeamFoto(p).then(
      (f) => {
        if (aktiv) setFoto(f)
      },
      (e: unknown) => {
        if (aktiv) {
          setFoto(null)
          setFotoFehler(fehlertext(e))
        }
      },
    )
    return () => {
      aktiv = false
    }
  }, [zustand.personId, fotoQuelle])

  const setKarte = useCallback((karte: Karte) => setZustand((z) => ({ ...z, karte, personId: null })), [setZustand])
  const setOption = useCallback(
    <K extends keyof VisitenkartenZustand>(schluessel: K, wert: VisitenkartenZustand[K]) => setZustand((z) => ({ ...z, [schluessel]: wert })),
    [setZustand],
  )
  const onEigenesFoto = useCallback(
    async (datei: File) => {
      try {
        setFoto(await ladeEigenesFoto(datei))
        setFotoQuelle('eigen')
        setFotoFehler(null)
        setOption('fotoAnzeigen', true)
      } catch (e) {
        setFotoFehler(fehlertext(e))
      }
    },
    [setOption],
  )

  const entprellt = useDebouncedValue(zustand.karte, 150)
  const fotoAktiv = zustand.fotoAnzeigen ? foto : null
  const firma = absender.firma
  const { hilfslinien, farbwelt: farbweltWahl } = zustand
  const sichtbar: readonly Farbwelt[] = farbweltWahl === 'beide' ? ALLE_FARBWELTEN : [farbweltWahl]

  const vorschauen = useMemo(() => {
    const m = new Map<string, string>()
    const welten: readonly Farbwelt[] = farbweltWahl === 'beide' ? ALLE_FARBWELTEN : [farbweltWahl]
    for (const design of DESIGNS) {
      for (const farbwelt of welten) {
        for (const seite of SEITEN) {
          const svg = renderKarte(design, { karte: entprellt, firma, farbwelt, seite, beschnitt: hilfslinien ? BESCHNITT : 0, hilfslinien, modus: 'vorschau', foto: fotoAktiv, messer })
          m.set(`${design.id}|${farbwelt}|${seite}`, svg)
        }
      }
    }
    return m
  }, [entprellt, firma, farbweltWahl, hilfslinien, fotoAktiv, messer])

  const erzeuger = (design: Design, farbwelt: Farbwelt): SvgErzeuger => (seite, o) =>
    renderKarte(design, { karte: zustand.karte, firma, farbwelt, seite, beschnitt: o.beschnitt, schnittmarken: o.schnittmarken, modus: 'export', schriftenCss: SCHRIFTEN_CSS, foto: fotoAktiv, messer })

  const exportiere = async (design: Design, farbwelt: Farbwelt, aktion: ExportAktion): Promise<void> => {
    const e = erzeuger(design, farbwelt)
    const basis = dateiBasis(design, farbwelt, zustand.karte.name)
    const beschnitt = zustand.beschnittExport ? BESCHNITT : 0
    switch (aktion.art) {
      case 'svg':
        exportiereSvg(e, aktion.seite, beschnitt, svgDateiname(basis, aktion.seite, beschnitt > 0))
        break
      case 'png300':
        await exportierePng(e, aktion.seite, 300, beschnitt, pngDateiname(basis, aktion.seite, 300, beschnitt > 0))
        break
      case 'png600':
        await exportierePng(e, aktion.seite, 600, beschnitt, pngDateiname(basis, aktion.seite, 600, beschnitt > 0))
        break
      case 'pdf':
        await exportierePdf(e, false, pdfDateiname(basis, false))
        break
      case 'pdfVerlustfrei':
        await exportierePdf(e, true, pdfDateiname(basis, true))
        break
      case 'drucken':
        oeffneDruckansicht(e, basis)
        break
    }
  }

  return (
    <div>
      {foto ? (
        <svg width="0" height="0" aria-hidden="true" focusable="false" className="absolute">
          <defs>
            <image id={FOTO_ID} href={foto.src} width={foto.w} height={foto.h} />
          </defs>
        </svg>
      ) : null}
      <KartenPanel zustand={zustand} hatFoto={foto !== null} fotoFehler={fotoFehler} onPerson={ladePerson} onKarte={setKarte} onOption={setOption} onEigenesFoto={onEigenesFoto} />
      <div className="mt-8">
        {DESIGNS.map((design) => (
          <DesignSektion
            key={design.id}
            design={design}
            farbwelten={sichtbar}
            svg={(farbwelt, seite) => vorschauen.get(`${design.id}|${farbwelt}|${seite}`) ?? ''}
            onExport={(farbwelt, aktion) => exportiere(design, farbwelt, aktion)}
          />
        ))}
      </div>
      <DruckHinweise />
    </div>
  )
}
```

- [ ] **Step 6: Lint und Build**

Run: `npm run lint && npm test && npm run build`
Expected: grün. Die Workspace-Komponente ist noch nicht in `App.tsx` eingebunden (Task 7); `tsc -b` prüft sie trotzdem.

- [ ] **Step 7: Sichtprüfung im Browser**

Für die Sichtprüfung vorübergehend in `src/App.tsx` den Ausdruck `tab === 'vergleich' ? <VergleichWorkspace … /> : <VollmachtWorkspace … />` NICHT ändern – stattdessen eine Wegwerfseite nutzen: `src/main.tsx` lokal so ändern, dass statt `<App />` `<VisitenkartenWorkspace absender={standardAbsender} />` gerendert wird (Import aus `./ui/visitenkarten/VisitenkartenWorkspace` und `./lib/absender`), `npm run dev` starten und mit Playwright prüfen:

Run: `npx playwright@1.56.1 screenshot --browser=chromium --channel=chrome --viewport-size=1440,2400 --full-page --wait-for-timeout=2500 http://localhost:5173/dokumente/ /tmp/vk-desktop.png`
Expected: Panel mit Personen-Segment (Niklas aktiv), Feldern und Optionen; darunter die Design-Abschnitte mit je zwei Zeilen (Hell, Dunkel) und je zwei Vorschauen; Foto sichtbar (Niklas, rund, Goldring), Schriften Montserrat/Raleway. Screenshot mit dem Read-Tool ansehen. Zusätzlich `--viewport-size=420,3000` für Mobil.

Danach `src/main.tsx` per `git checkout src/main.tsx` zurücksetzen – die Wegwerfänderung wird nicht committet.

- [ ] **Step 8: Commit**

```bash
git add src/ui/visitenkarten
git commit -m "feat(visitenkarten): Tab-Oberfläche – Kartendetails, Design-Abschnitte mit Vorschau und Exporten, Hinweise"
```

---

### Hinweise für die Design-Tasks 4–6

Jeder Design-Task ersetzt zwei Platzhalter-Dateien aus Task 1 vollständig durch die Layouts unten (gleicher Exportname, gleiche `id`/`nr`/`titel`). Er ändert keine andere Datei. Der Zeichner (`src/lib/visitenkarten/svg.ts`) liefert:

- `z.b` (Beschnitt), `z.W`/`z.H` (Gesamtmaß inkl. Beschnitt), `z.p` (Palette), `z.k` (Karte), `z.dunkel`, `z.hatFoto()`
- `z.rect(x, y, w, h, fill, {rx, stroke, sw, opacity, dash})`, `z.polygon(punkte, fill)`, `z.kreis(cx, cy, r, fill, {stroke, sw})`, `z.linie(...)`
- `z.text(x, y, groesse, fill, inhalt, {schrift, gewicht, ls, anker, opacity, maxB, gross})` – leerer Inhalt ergibt `''`
- `z.eyebrow(x, y, groesse, fill, inhalt, o)` – Montserrat 600, Großbuchstaben, Laufweite 0.18 em
- `z.logo(x, y, markenHoehe, {base, gold, opacity})` → `{ w, svg }` (Breite = 4.7 × Höhe); `z.marke(x, y, hoehe, o)` → `{ w, svg }` (Breite = 1.253 × Höhe); `z.logoGestapelt(cx, y, markenHoehe, o)` → `{ h, svg }`
- `z.foto(x, y, d, {ring, rw, platte})`, `z.qrPlatte(qr, x, y, groesse, {ruhe, stroke, sw})`, `z.vcardQr()`, `z.linkQr()`
- `z.kontaktzeilen(x, yStart, pitch, {wertX, rechts, wertGroesse, wertGewicht, adresseOhneLabel, adresseGroesse, ohneAdresse, labelFill, wertFill})` → `{ svg, anzahl }`

Alle Koordinaten sind Trim-Koordinaten plus `b`. Ablauf je Task: Dateien ersetzen → `npx vitest run src/lib/visitenkarten/render.test.ts` (Sicherheitsabstand!) → `npm run render:visitenkarten` → Screenshots der eigenen Galerien (`galerie-<nr>.html`) mit Playwright → Screenshots mit dem Read-Tool ansehen und auf Überlappungen, abgeschnittene Texte, falsche Schrift (Arial-Fallback), unlesbare Kontraste prüfen → Feinkorrekturen (nur Koordinaten/Größen innerhalb der Sicherheitszone) → Lint/Tests/Build → Commit. Die Screenshot-Pfade gehören in den Report.

Screenshot-Befehl (Beispiel Design 01): `npx playwright@1.56.1 screenshot --browser=chromium --channel=chrome --viewport-size=1500,1100 --full-page "file://$PWD/out/visitenkarten/galerie-01.html" out/visitenkarten/galerie-01.png`

---

### Task 4: Designs 01 Klassik und 02 Signatur

**Files:**
- Modify (vollständig ersetzen): `src/lib/visitenkarten/designs/klassik.ts`, `src/lib/visitenkarten/designs/signatur.ts`

**Interfaces:** Consumes `Zeichner` (Task 1), `texte.ts`. Produces die Exporte `klassik`, `signatur` (unverändert registriert in `designs/index.ts`).

- [ ] **Step 1: Klassik**

`src/lib/visitenkarten/designs/klassik.ts`:

```ts
import { CLAIM, LEISTUNGEN } from '../texte'
import type { Design } from './design'

export const klassik: Design = {
  id: 'klassik',
  nr: '01',
  titel: 'Klassik',
  beschreibung:
    'Die redaktionelle Ruhe der Website: Logo oben links, Rolle als goldene Zeile, Name groß, feine Goldlinie und klar beschriftete Kontaktzeilen – das Foto sitzt als runder Ausschnitt oben rechts.',
  vorderseite(z) {
    const { b, W, H, p, k } = z
    const foto = z.hatFoto()
    let s = z.rect(0, 0, W, H, p.grund)
    s += z.logo(b + 7, b + 7, 7).svg
    if (foto) s += z.foto(b + 60, b + 7, 18)
    s += z.eyebrow(b + 7, b + 24.6, 1.7, p.akzentText, k.rolle, { maxB: foto ? 48 : 64 })
    s += z.text(b + 7, b + 31, 4.4, p.text, k.name, { schrift: 'display', gewicht: 700, ls: 0.02, gross: true, maxB: foto ? 50 : 64 })
    s += z.rect(b + 7, b + 33.2, 14, 0.6, p.akzent)
    s += z.kontaktzeilen(b + 7, b + 39, 3.3, { wertX: b + 16, rechts: b + 78 }).svg
    return s
  },
  rueckseite(z) {
    const { b, W, H, p, k } = z
    const lw = 44
    let s = z.rect(0, 0, W, H, p.grund)
    s += z.logo(b + (85 - lw) / 2, b + 14, lw / 4.7).svg
    s += z.rect(b + 32.5, b + 28.2, 20, 0.5, p.akzent)
    s += z.eyebrow(b + 42.5, b + 34.6, 1.9, p.text, CLAIM, { anker: 'middle' })
    s += z.eyebrow(b + 42.5, b + 39.6, 1.35, p.label, LEISTUNGEN, { ls: 0.14, anker: 'middle' })
    s += z.eyebrow(b + 42.5, b + 46.2, 1.9, p.akzentText, k.web, { ls: 0.16, anker: 'middle', maxB: 70 })
    return s
  },
}
```

- [ ] **Step 2: Signatur**

`src/lib/visitenkarten/designs/signatur.ts`:

```ts
import { LEISTUNGEN } from '../texte'
import type { Design } from './design'

export const signatur: Design = {
  id: 'signatur',
  nr: '02',
  titel: 'Signatur',
  beschreibung:
    'Die A-Marke als großes Wasserzeichen, das rechts über die Kante läuft – der Querbalken in Gold, der Winkel nur angedeutet. Auf der Rückseite das gestapelte Logo wie auf dem runden Markenzeichen.',
  vorderseite(z) {
    const { b, W, H, p, k } = z
    let s = z.rect(0, 0, W, H, p.grund)
    // Wasserzeichen: 64 mm hohe Marke, Spitze an der rechten Schnittkante, Querbalken unten rechts sichtbar
    s += z.marke(b + 44, b - 4.5, 64, {
      base: z.dunkel ? 'rgba(245,243,238,0.05)' : 'rgba(17,19,21,0.045)',
      gold: z.dunkel ? 'rgba(213,166,46,0.42)' : 'rgba(213,166,46,0.34)',
    }).svg
    s += z.logo(b + 7, b + 7, 7).svg
    if (z.hatFoto()) s += z.foto(b + 61, b + 7, 17)
    s += z.eyebrow(b + 7, b + 26, 1.7, p.akzentText, k.rolle, { maxB: 50 })
    s += z.text(b + 7, b + 32.6, 4.6, p.text, k.name, { schrift: 'display', gewicht: 700, ls: 0.02, gross: true, maxB: 52 })
    s += z.rect(b + 7, b + 34.8, 16, 0.7, p.akzent)
    s += z.kontaktzeilen(b + 7, b + 39.8, 3.1, { wertX: b + 16, rechts: b + 70, wertGroesse: 2.2 }).svg
    return s
  },
  rueckseite(z) {
    const { b, W, H, p } = z
    let s = z.rect(0, 0, W, H, p.grund)
    s += z.logoGestapelt(b + 42.5, b + 8, 18).svg
    s += z.eyebrow(b + 42.5, b + 48.6, 1.3, p.label, LEISTUNGEN, { ls: 0.14, anker: 'middle' })
    return s
  },
}
```

- [ ] **Step 3: Tests, Galerie, Sichtprüfung, Commit**

Run: `npx vitest run src/lib/visitenkarten/render.test.ts && npm run render:visitenkarten` und Screenshots von `galerie-01.html` und `galerie-02.html` (Befehl oben). Prüfen: Foto überdeckt keinen Text; Name nicht gestaucht bei „Niklas Trojovsky“; Wasserzeichen dezent, Goldbalken rechts unten sichtbar; gestapeltes Logo mit Goldlinien beidseits von ENERGY.

Run: `npm run lint && npm test && npm run build`

```bash
git add src/lib/visitenkarten/designs/klassik.ts src/lib/visitenkarten/designs/signatur.ts
git commit -m "feat(visitenkarten): Designs 01 Klassik und 02 Signatur"
```

---

### Task 5: Designs 03 Rahmen und 04 Porträt

**Files:**
- Modify (vollständig ersetzen): `src/lib/visitenkarten/designs/rahmen.ts`, `src/lib/visitenkarten/designs/portraet.ts`

**Interfaces:** Consumes `Zeichner`, `texte.ts`. Produces `rahmen`, `portraet`.

- [ ] **Step 1: Rahmen**

`src/lib/visitenkarten/designs/rahmen.ts`:

```ts
import type { Zeichner } from '../svg'
import { CLAIM, LEISTUNGEN } from '../texte'
import type { Design } from './design'

/** Goldene Haarlinie 4.5 mm innerhalb der Schnittkante, kleine Goldquadrate in den Ecken. */
function goldRahmen(z: Zeichner): string {
  const { b, p } = z
  let s = z.rect(b + 4.5, b + 4.5, 76, 46, 'none', { stroke: p.akzent, sw: 0.3 })
  for (const [x, y] of [[4.5, 4.5], [80.5, 4.5], [4.5, 50.5], [80.5, 50.5]] as const) {
    s += z.rect(b + x - 0.6, b + y - 0.6, 1.2, 1.2, p.akzent)
  }
  return s
}

export const rahmen: Design = {
  id: 'rahmen',
  nr: '03',
  titel: 'Rahmen',
  beschreibung:
    'Feine Goldlinie als Rahmen mit kleinen Eckpunkten und eine zentrierte Komposition: Marke oder Foto oben, darunter Name, Rolle und die Kontaktdaten in ruhigen Zeilen – die klassische Karte mit Goldkante.',
  vorderseite(z) {
    const { b, W, H, p, k } = z
    let s = z.rect(0, 0, W, H, p.grund) + goldRahmen(z)
    if (z.hatFoto()) s += z.foto(b + 35.5, b + 6.5, 14)
    else s += z.marke(b + 36.24, b + 7.5, 10).svg
    s += z.text(b + 42.5, b + 27.2, 4.2, p.text, k.name, { schrift: 'display', gewicht: 700, ls: 0.03, gross: true, anker: 'middle', maxB: 66 })
    s += z.eyebrow(b + 42.5, b + 31.6, 1.6, p.akzentText, k.rolle, { anker: 'middle', maxB: 66 })
    s += z.rect(b + 36.5, b + 34.2, 12, 0.5, p.akzent)
    // Geschützte Leerzeichen (U+2003): normale Leerzeichen würde SVG zusammenfassen
    const kontakt = [k.telefon, k.email].filter(Boolean).join(' · ')
    s += z.text(b + 42.5, b + 40, 2.2, p.textSanft, kontakt, { anker: 'middle', gewicht: 500, maxB: 66 })
    s += z.eyebrow(b + 42.5, b + 44.2, 1.6, p.akzentText, k.web, { ls: 0.16, anker: 'middle', maxB: 66 })
    s += z.text(b + 42.5, b + 48.3, 1.9, p.label, k.adresse, { anker: 'middle', maxB: 66 })
    return s
  },
  rueckseite(z) {
    const { b, W, H, p, k } = z
    const lw = 42
    let s = z.rect(0, 0, W, H, p.grund) + goldRahmen(z)
    s += z.logo(b + (85 - lw) / 2, b + 13, lw / 4.7).svg
    s += z.eyebrow(b + 42.5, b + 30.5, 1.35, p.label, LEISTUNGEN, { ls: 0.16, anker: 'middle' })
    s += z.eyebrow(b + 42.5, b + 38.4, 1.8, p.text, CLAIM, { ls: 0.14, anker: 'middle' })
    s += z.eyebrow(b + 42.5, b + 45.6, 1.8, p.akzentText, k.web, { ls: 0.16, anker: 'middle', maxB: 66 })
    return s
  },
}
```

- [ ] **Step 2: Porträt**

`src/lib/visitenkarten/designs/portraet.ts`:

```ts
import { CLAIM, INSTAGRAM_HANDLE, LEISTUNGEN } from '../texte'
import type { Design } from './design'

export const portraet: Design = {
  id: 'portraet',
  nr: '04',
  titel: 'Porträt',
  beschreibung:
    'Das Gesicht im Mittelpunkt: großes rundes Foto mit Goldring links, rechts Logo, Rolle, Name und Kontakt. Ohne Foto trägt der Goldring die Marke als Monogramm. Die Rückseite ist die Kontrastfläche – Ink mit hellem Logo oder Gold mit dunklem.',
  vorderseite(z) {
    const { b, W, H, p, k } = z
    let s = z.rect(0, 0, W, H, p.grund)
    if (z.hatFoto()) {
      s += z.foto(b + 7, b + 14.5, 26, { rw: 0.6 })
    } else {
      s += z.kreis(b + 20, b + 27.5, 13, p.platte, { stroke: p.akzent, sw: 0.6 })
      s += z.marke(b + 12.48, b + 21.5, 12).svg
    }
    const lw = 28
    s += z.logo(b + 78 - lw, b + 6.5, lw / 4.7).svg
    s += z.eyebrow(b + 38, b + 20.5, 1.6, p.akzentText, k.rolle, { maxB: 40 })
    s += z.text(b + 38, b + 26.5, 3.8, p.text, k.name, { schrift: 'display', gewicht: 700, ls: 0.02, gross: true, maxB: 40 })
    s += z.rect(b + 38, b + 28.6, 12, 0.6, p.akzent)
    s += z.kontaktzeilen(b + 38, b + 34.4, 3.4, { wertX: b + 46, rechts: b + 78, wertGroesse: 2.15, adresseOhneLabel: true, adresseGroesse: 1.9 }).svg
    return s
  },
  rueckseite(z) {
    const { b, W, H, p, k } = z
    const lw = 46
    let s = z.rect(0, 0, W, H, p.panel)
    s += z.logo(b + (85 - lw) / 2, b + 15, lw / 4.7, { base: p.panelLogoBase, gold: p.panelGold }).svg
    s += z.eyebrow(b + 42.5, b + 32.6, 1.9, p.panelText, CLAIM, { ls: 0.16, anker: 'middle', opacity: 0.92 })
    s += z.eyebrow(b + 42.5, b + 38.2, 1.35, p.panelText, LEISTUNGEN, { ls: 0.14, anker: 'middle', opacity: 0.65 })
    s += z.eyebrow(b + 7, b + 48.4, 1.45, p.panelAkzent, k.web, { ls: 0.14, maxB: 40 })
    s += z.eyebrow(b + 78, b + 48.4, 1.45, p.panelAkzent, INSTAGRAM_HANDLE, { ls: 0.14, anker: 'end' })
    return s
  },
}
```

- [ ] **Step 3: Tests, Galerie, Sichtprüfung, Commit**

Run: `npx vitest run src/lib/visitenkarten/render.test.ts && npm run render:visitenkarten`, Screenshots von `galerie-03.html` und `galerie-04.html`. Prüfen: Rahmen und Eckpunkte sauber, alle zentrierten Zeilen innerhalb des Rahmens; beim Porträt Foto und Textspalte ohne Überlappung, Rückseite in Ink (hell) bzw. Gold (dunkel) mit lesbarem Logo.

Run: `npm run lint && npm test && npm run build`

```bash
git add src/lib/visitenkarten/designs/rahmen.ts src/lib/visitenkarten/designs/portraet.ts
git commit -m "feat(visitenkarten): Designs 03 Rahmen und 04 Porträt"
```

---

### Task 6: Designs 05 Kontakt-QR und 06 Schräge

**Files:**
- Modify (vollständig ersetzen): `src/lib/visitenkarten/designs/kontakt.ts`, `src/lib/visitenkarten/designs/schraege.ts`

**Interfaces:** Consumes `Zeichner`, `texte.ts`, `src/brand/colors.ts`. Produces `kontakt`, `schraege`.

- [ ] **Step 1: Kontakt-QR**

`src/lib/visitenkarten/designs/kontakt.ts`:

```ts
import type { Design } from './design'

export const kontakt: Design = {
  id: 'kontakt',
  nr: '05',
  titel: 'Kontakt-QR',
  beschreibung:
    'Einmal scannen, gespeichert: Der QR-Code auf der Vorderseite trägt die vCard mit Name, Rolle, Nummer, E-Mail und Adresse und wird live aus den Kartendetails codiert. Die Rückseite verlinkt per QR auf Website, WhatsApp oder Instagram.',
  vorderseite(z) {
    const { b, W, H, p, k } = z
    let s = z.rect(0, 0, W, H, p.grund)
    s += z.logo(b + 7, b + 7, 6.5).svg
    if (z.hatFoto()) s += z.foto(b + 68.5, b + 5.2, 9.5, { rw: 0.45 })
    s += z.eyebrow(b + 7, b + 25, 1.65, p.akzentText, k.rolle, { maxB: 44 })
    s += z.text(b + 7, b + 31.2, 4.1, p.text, k.name, { schrift: 'display', gewicht: 700, ls: 0.02, gross: true, maxB: 44 })
    s += z.rect(b + 7, b + 33.3, 12, 0.6, p.akzent)
    s += z.kontaktzeilen(b + 7, b + 39, 3.5, { wertX: b + 16, rechts: b + 52, ohneAdresse: true, wertGroesse: 2.25 }).svg
    s += z.qrPlatte(z.vcardQr(), b + 54, b + 15.5, 24, { stroke: p.linie, sw: 0.3 })
    s += z.eyebrow(b + 66, b + 43.2, 1.3, p.label, 'KONTAKT SPEICHERN', { ls: 0.14, anker: 'middle' })
    return s
  },
  rueckseite(z) {
    const { b, W, H, p, k } = z
    let s = z.rect(0, 0, W, H, p.grund)
    s += z.qrPlatte(z.linkQr(), b + 33, b + 9.5, 19, { ruhe: 1.7 })
    const ziel = (k.qrLink.trim() || k.web).replace(/^https?:\/\//i, '').replace(/[?#].*$/, '').replace(/\/$/, '')
    s += z.eyebrow(b + 42.5, b + 32.8, 1.7, p.akzentText, ziel, { ls: 0.16, anker: 'middle', maxB: 70 })
    const lw = 34
    s += z.logo(b + (85 - lw) / 2, b + 38.5, lw / 4.7).svg
    return s
  },
}
```

- [ ] **Step 2: Schräge**

`src/lib/visitenkarten/designs/schraege.ts`:

```ts
import { farben } from '../../../brand/colors'
import type { Punkt, Zeichner } from '../svg'
import { CLAIM, LEISTUNGEN, LEISTUNGEN_KURZ, LEISTUNGEN_ZEILEN } from '../texte'
import type { Design } from './design'

/** Neigung der Panelkante: 8 mm Versatz auf 55 mm Höhe – parallel zur linken Flanke der A-Marke. */
const NEIGUNG = 8 / 55

/** Linkes Panel: Kante von (35, 0) nach (27, 55) in Trim-Koordinaten, über den Beschnitt verlängert. */
function panel(z: Zeichner): Punkt[] {
  const { b, H } = z
  return [[0, 0], [b + 35 + NEIGUNG * b, 0], [b + 27 - NEIGUNG * b, H], [0, H]]
}

export const schraege: Design = {
  id: 'schraege',
  nr: '06',
  titel: 'Schräge',
  beschreibung:
    'Zweifarbig mit Haltung: Ein Panel mit schräger Kante – geneigt wie die Flanke der A-Marke – trägt Marke und Foto, rechts stehen Rolle, Name und Kontakt. Hell mit Ink-Panel auf Papier, dunkel mit Gold-Panel auf Ink.',
  vorderseite(z) {
    const { b, W, H, p, k } = z
    let s = z.rect(0, 0, W, H, p.grund)
    s += z.polygon(panel(z), p.panel)
    s += z.marke(b + 7.5, b + 7.5, 12, { base: p.panelLogoBase, gold: p.panelGold }).svg
    if (z.hatFoto()) {
      s += z.foto(b + 7, b + 31, 16, { ring: p.panelAkzent, platte: z.dunkel ? farben.goldDeep : farben.ink800 })
    } else {
      s += z.rect(b + 7.5, b + 33.5, 8, 0.5, p.panelAkzent)
      LEISTUNGEN_ZEILEN.forEach((zeile, i) => {
        s += z.eyebrow(b + 7.5, b + 38.5 + i * 3.6, 1.3, p.panelText, zeile, { ls: 0.16, opacity: 0.85 })
      })
    }
    s += z.eyebrow(b + 41, b + 16, 1.6, p.akzentText, k.rolle, { maxB: 37 })
    s += z.text(b + 41, b + 22, 3.7, p.text, k.name, { schrift: 'display', gewicht: 700, ls: 0.02, gross: true, maxB: 37 })
    s += z.rect(b + 41, b + 24.1, 12, 0.6, p.akzent)
    s += z.kontaktzeilen(b + 41, b + 30, 3.5, { wertX: b + 49, rechts: b + 78, wertGroesse: 2.15, adresseOhneLabel: true, adresseGroesse: 1.9 }).svg
    s += z.eyebrow(b + 41, b + 48, 1.3, p.label, LEISTUNGEN_KURZ, { ls: 0.12, maxB: 37 })
    return s
  },
  rueckseite(z) {
    const { b, W, H, p, k } = z
    let s = z.rect(0, 0, W, H, p.panel)
    // Schräger Streifen in der Grundfarbe rechts: Kante von (66, 0) nach (58, 55)
    s += z.polygon([[b + 66 + NEIGUNG * b, 0], [W, 0], [W, H], [b + 58 - NEIGUNG * b, H]], p.grund)
    s += z.logo(b + 8, b + 14, 40 / 4.7, { base: p.panelLogoBase, gold: p.panelGold }).svg
    s += z.eyebrow(b + 8, b + 31.5, 1.7, p.panelText, CLAIM, { ls: 0.14, opacity: 0.92, maxB: 48 })
    s += z.eyebrow(b + 8, b + 37.5, 1.3, p.panelText, LEISTUNGEN, { ls: 0.12, opacity: 0.65, maxB: 48 })
    s += z.eyebrow(b + 8, b + 46.5, 1.6, p.panelAkzent, k.web, { ls: 0.16, maxB: 48 })
    return s
  },
}
```

- [ ] **Step 3: Tests, Galerie, Sichtprüfung, Commit**

Run: `npx vitest run src/lib/visitenkarten/render.test.ts && npm run render:visitenkarten`, Screenshots von `galerie-05.html` und `galerie-06.html`. Prüfen: QR-Platten frei von Text, „KONTAKT SPEICHERN“ zentriert unter dem Code, Host-Zeile lesbar; beim Panel keine Überlappung zwischen schräger Kante und Foto/Text, Marke auf dem Panel kontrastreich (hell: Creme/Gold auf Ink, dunkel: Ink/Creme auf Gold).

Run: `npm run lint && npm test && npm run build`

```bash
git add src/lib/visitenkarten/designs/kontakt.ts src/lib/visitenkarten/designs/schraege.ts
git commit -m "feat(visitenkarten): Designs 05 Kontakt-QR und 06 Schräge"
```

---

### Task 7: Integration – dritter Tab, App-Test, README

**Files:**
- Modify: `src/App.tsx`, `src/App.test.tsx`, `README.md`

**Interfaces:** Consumes `VisitenkartenWorkspace` (Task 3).

- [ ] **Step 1: App-Test erweitern (fehlschlagend)**

In `src/App.test.tsx` im bestehenden Test nach `expect(html).toContain('Vollmacht')` ergänzen:

```ts
    expect(html).toContain('Visitenkarten')
    expect(html).not.toContain('aria-controls="panel-visitenkarten"')
```

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL („Visitenkarten“ fehlt)

- [ ] **Step 2: Tab einbauen**

`src/App.tsx` – Typ, Tab-Liste und Panel:

```tsx
import { VisitenkartenWorkspace } from './ui/visitenkarten/VisitenkartenWorkspace'

type Tab = 'vergleich' | 'vollmacht' | 'visitenkarten'

const TABS: { wert: Tab; label: string; id: string; panelId: string }[] = [
  { wert: 'vergleich', label: 'Energie-Vergleich', id: 'tab-vergleich', panelId: 'panel-vergleich' },
  { wert: 'vollmacht', label: 'Vollmacht', id: 'tab-vollmacht', panelId: 'panel-vollmacht' },
  { wert: 'visitenkarten', label: 'Visitenkarten', id: 'tab-visitenkarten', panelId: 'panel-visitenkarten' },
]
```

und im Tabpanel:

```tsx
          {tab === 'vergleich' ? <VergleichWorkspace absender={absender} /> : null}
          {tab === 'vollmacht' ? <VollmachtWorkspace absender={absender} /> : null}
          {tab === 'visitenkarten' ? <VisitenkartenWorkspace absender={absender} /> : null}
```

Run: `npx vitest run src/App.test.tsx`
Expected: PASS

- [ ] **Step 3: README**

In `README.md` die Einleitung („Interner Generator für zwei PDF-Dokumente …“) auf drei Dokumente erweitern und als dritten Punkt ergänzen:

```markdown
- **Visitenkarten**: sechs Designs (Klassik, Signatur, Rahmen, Porträt, Kontakt-QR, Schräge) in je einer hellen und dunklen Farbwelt, 85 × 55 mm. Person aus dem Team wählen oder frei eintragen, Foto zuschalten oder eigenes hochladen; QR-Codes (vCard und Link) entstehen live. Exporte: SVG mit eingebetteten Schriften, PNG 300/600 dpi (optional mit 3 mm Beschnitt), Druck-PDF 600 dpi mit Trim-Box (JPEG oder verlustfrei) und „Drucken → Vektor-PDF“ über den Browser-Druckdialog. `?person=<id>` (niklas, gabriel, patrick, zentrale) wählt die Person vor.
```

Im Abschnitt „Entwicklung“ ergänzen:

```bash
npm run render:visitenkarten # schreibt alle 24 Karten-SVGs und Galerien nach out/visitenkarten/
```

Im Abschnitt „Aufbau“ ergänzen: `src/lib/visitenkarten` – Render-Engine der Visitenkarten (Zeichner in mm, Paletten, Designs, vCard/QR, Raster-PDF-Writer); `src/ui/visitenkarten` – Tab-Oberfläche und Exporte.

- [ ] **Step 4: Lint, Tests, Build, Sichtprüfung, Commit**

Run: `npm run lint && npm test && npm run build`

Dann `npm run preview` (oder `npm run dev`) und `npx playwright@1.56.1 screenshot --browser=chromium --channel=chrome --viewport-size=1440,2600 --full-page --wait-for-timeout=2500 "http://localhost:4173/dokumente/?person=gabriel" /tmp/vk-app.png` – der Tab „Visitenkarten“ muss per Klick erreichbar sein (im Screenshot ist der gespeicherte Standard-Tab „Energie-Vergleich“ aktiv; für die Prüfung des Tabs vorher im Browser klicken oder `localStorage` `augusta-dokumente:v1:tab` auf `"visitenkarten"` setzen – Playwright-CLI: stattdessen nach dem Screenshot der Startseite mit `--wait-for-selector` nicht möglich, daher genügt hier: Startseite zeigt drei Tabs; die Tab-Inhalte wurden in Task 3 geprüft).

```bash
git add src/App.tsx src/App.test.tsx README.md
git commit -m "feat: Tab „Visitenkarten“ in der App, README"
```
