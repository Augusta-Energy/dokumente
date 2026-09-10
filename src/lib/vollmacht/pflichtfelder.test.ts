import { describe, expect, it } from 'vitest'
import { beispielVollmacht } from './beispiel'
import { fehlendePflichtfelder } from './pflichtfelder'
import { leereVollmacht } from './types'

describe('fehlendePflichtfelder (Vollmacht)', () => {
  it('ist leer für die Beispieldaten', () => {
    expect(fehlendePflichtfelder(beispielVollmacht())).toEqual([])
  })
  it('listet die Lücken einer leeren Vorlage', () => {
    expect(fehlendePflichtfelder(leereVollmacht())).toEqual([
      'Name des Vollmachtgebers',
      'Anschrift des Vollmachtgebers',
      'Adresse der Lieferstelle 1',
    ])
  })
  it('verlangt eine Energieart, eine Lieferstelle und bei Befristung ein Datum', () => {
    const d = beispielVollmacht()
    d.energiearten = { strom: false, gas: false }
    d.lieferstellen = []
    d.geltung = { art: 'befristet', bis: '' }
    expect(fehlendePflichtfelder(d)).toEqual(['Mindestens eine Energieart', 'Mindestens eine Lieferstelle', 'Befristung (Datum)'])
  })
})
