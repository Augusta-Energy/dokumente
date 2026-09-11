import { farben } from '../../brand/colors'
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
  readonly modus: RenderModus
  /** Rohdaten des Fotos; nicht öffentlich, da `foto()` unten dieselbe Bezeichnung als Zeichenmethode trägt. */
  private readonly fotoDaten: Foto | null
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
    this.fotoDaten = c.foto
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
    // SVG hängt die Laufweite (letter-spacing) auch hinter das letzte Zeichen; bei zentriertem oder
    // rechtsbündigem Anker verschiebt diese unsichtbare Extra-Lücke die sichtbaren Glyphen vom Anker weg.
    // Wir schieben x um die halbe (middle) bzw. ganze (end) Lücke, damit die sichtbaren Zeichen wieder
    // exakt zentriert bzw. ausgerichtet erscheinen.
    const xAnker = o.ls && o.anker === 'middle' ? x + (o.ls * groesse) / 2 : o.ls && o.anker === 'end' ? x + o.ls * groesse : x
    const attr = [`x="${N(xAnker)}" y="${N(y)}"`, `font-family="${FAMILIE_CSS[schrift]}"`, `font-size="${N(groesse)}"`, `font-weight="${gewicht}"`, `fill="${fill}"`]
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
    return this.fotoDaten !== null
  }

  /** Rundes, halb entsättigtes Foto mit Platte und Goldring. Leerer String ohne Foto. */
  foto(x: number, y: number, d: number, o: FotoOpt = {}): string {
    const f = this.fotoDaten
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
        : `<image xlink:href="${esc(f.src)}" href="${esc(f.src)}" x="0" y="0" width="${f.w}" height="${f.h}" ${filter}/>`
    return (
      `<clipPath id="${id}"><circle cx="${N(cx)}" cy="${N(cy)}" r="${N(r)}"/></clipPath>` +
      this.kreis(cx, cy, r, o.platte ?? this.p.platte) +
      `<g clip-path="url(#${id})"><svg x="${N(x)}" y="${N(y)}" width="${N(d)}" height="${N(d)}" viewBox="${N(c.x)} ${N(c.y)} ${N(c.s)} ${N(c.s)}">${bild}</svg></g>` +
      this.kreis(cx, cy, r, 'none', { stroke: o.ring ?? this.p.akzent, sw: o.rw ?? 0.5 })
    )
  }

  /** QR-Code auf weißer Platte mit Ruhezone; passt der Text nicht in einen QR-Code (q === null),
   *  steht statt des Codes eine zentrierte Eyebrow-Meldung auf der Platte. */
  qrPlatte(q: QrPfad | null, x: number, y: number, groesse: number, o: QrOpt = {}): string {
    const platte = this.rect(x, y, groesse, groesse, '#ffffff', { rx: 0.6, stroke: o.stroke, sw: o.sw ?? 0.3 })
    if (!q) {
      return platte + this.text(x + groesse / 2, y + groesse / 2 + 0.6, 1.4, farben.ink, 'QR ZU LANG', { schrift: 'display', gewicht: 600, ls: 0.14, anker: 'middle' })
    }
    // Bei sehr kleiner groesse darf die Ruhezone nicht so groß werden, dass die Modulgröße negativ wird.
    const ruhe = Math.min(o.ruhe ?? Math.max(1.6, groesse * 0.085), groesse / 4)
    const m = (groesse - 2 * ruhe) / q.n
    return platte + `<g transform="translate(${N(x + ruhe)} ${N(y + ruhe)}) scale(${N(m)})"><path d="${q.pfad}" fill="${farben.ink}"/></g>`
  }

  vcardQr(): QrPfad | null {
    return qrPfad(vcardText(this.k, this.firma))
  }

  linkQr(): QrPfad | null {
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
