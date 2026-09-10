import { StyleSheet } from '@react-pdf/renderer'
import { farben } from '../brand/colors'
import { SCHRIFT } from '../brand/fonts'

/** A4 = 595,28 × 841,89 pt. Ränder in pt. */
export const SEITE = { randOben: 104, randUnten: 76, randSeite: 48 } as const
export const GROESSE = { titel: 19, eyebrow: 7, label: 6.5, ueberschrift: 10, text: 9.2, klein: 7.8, fussnote: 7 } as const

export const styles = StyleSheet.create({
  seite: {
    paddingTop: SEITE.randOben,
    paddingBottom: SEITE.randUnten,
    paddingHorizontal: SEITE.randSeite,
    fontFamily: SCHRIFT.text,
    fontSize: GROESSE.text,
    lineHeight: 1.45,
    color: farben.ink,
  },
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
    marginTop: 5,
  },
  goldRule: { width: 40, height: 1, backgroundColor: farben.gold, marginTop: 8, marginBottom: 12 },
  ueberschrift: {
    fontFamily: SCHRIFT.display,
    fontSize: GROESSE.ueberschrift,
    fontWeight: 600,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: farben.ink,
    marginTop: 12,
    marginBottom: 5,
  },
  absatz: { marginBottom: 6 },
  klein: { fontSize: GROESSE.klein, color: farben.ink600 },
  fussnote: { fontSize: GROESSE.fussnote, color: farben.muted, lineHeight: 1.4, marginTop: 2 },
  fett: { fontWeight: 600 },
  gold: { color: farben.goldDeep },
})
