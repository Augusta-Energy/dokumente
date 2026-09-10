import { StyleSheet } from '@react-pdf/renderer'
import { farben } from '../brand/colors'
import { SCHRIFT } from '../brand/fonts'

/** A4 = 595,28 × 841,89 pt. Ränder in pt. */
export const SEITE = { randOben: 104, randObenDicht: 85, randUnten: 76, randSeite: 48 } as const
export const GROESSE = { titel: 19, eyebrow: 7, label: 6.5, ueberschrift: 10, text: 9.2, textDicht: 9, klein: 7.8, fussnote: 7 } as const

/** Gemeinsame Basis für `seite`/`seiteDicht` – `StyleSheet.create`-Objekte lassen sich nicht spreaden, bevor sie erzeugt sind. */
const seiteGemeinsam = {
  paddingBottom: SEITE.randUnten,
  paddingHorizontal: SEITE.randSeite,
  fontFamily: SCHRIFT.text,
  color: farben.ink,
}

export const styles = StyleSheet.create({
  seite: {
    ...seiteGemeinsam,
    paddingTop: SEITE.randOben,
    fontSize: GROESSE.text,
  },
  /** Dichtere Variante für Seite 3 (Konditionen im Detail): weniger Kopfabstand, kleinere Schrift. */
  seiteDicht: {
    ...seiteGemeinsam,
    paddingTop: SEITE.randObenDicht,
    fontSize: GROESSE.textDicht,
  },
  // Zeilenhöhe liegt bewusst NICHT auf der Seite: react-pdf rendert dynamische Texte (Seitenzahl) nicht, wenn sie eine
  // lineHeight erben. Die fontSize muss hier mitgesetzt werden, sonst wird die unitless lineHeight gegen 18 pt aufgelöst.
  inhalt: { fontSize: GROESSE.text, lineHeight: 1.45 },
  inhaltDicht: { fontSize: GROESSE.textDicht, lineHeight: 1.3 },
  kopf: {
    position: 'absolute',
    top: 32,
    left: SEITE.randSeite,
    right: SEITE.randSeite,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: farben.gold,
  },
  kopfKontakt: { textAlign: 'right', fontSize: GROESSE.klein, color: farben.muted, lineHeight: 1.4 },
  fuss: {
    position: 'absolute',
    bottom: 28,
    left: SEITE.randSeite,
    right: SEITE.randSeite,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: farben.line,
  },
  fussText: { fontSize: GROESSE.fussnote, color: farben.muted, lineHeight: 1.4 },
  // Keine lineHeight: dieser Style trägt den dynamischen „Seite x von y“-Text (siehe Kommentar bei `inhalt`).
  seitenzahl: { fontSize: GROESSE.fussnote, color: farben.muted },
  laufzeile: { fontSize: GROESSE.klein, color: farben.muted, marginBottom: 12 },
  eyebrow: {
    fontFamily: SCHRIFT.display,
    fontSize: GROESSE.eyebrow,
    fontWeight: 600,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: farben.goldDeep,
  },
  label: {
    fontFamily: SCHRIFT.display,
    fontSize: GROESSE.label,
    fontWeight: 600,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: farben.muted,
  },
  titel: {
    fontFamily: SCHRIFT.display,
    fontSize: GROESSE.titel,
    fontWeight: 700,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    lineHeight: 1.12,
    color: farben.ink,
    marginTop: 3,
  },
  goldRule: { width: 40, height: 1, backgroundColor: farben.gold, marginTop: 6, marginBottom: 8 },
  ueberschrift: {
    fontFamily: SCHRIFT.display,
    fontSize: GROESSE.ueberschrift,
    fontWeight: 600,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: farben.ink,
    marginTop: 6,
    marginBottom: 3,
  },
  absatz: { marginBottom: 6 },
  klein: { fontSize: GROESSE.klein, color: farben.ink600 },
  fussnote: { fontSize: GROESSE.fussnote, color: farben.muted, lineHeight: 1.4, marginTop: 2 },
  fett: { fontWeight: 600 },
  gold: { color: farben.goldDeep },
})
