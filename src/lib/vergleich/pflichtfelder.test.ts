import { describe, expect, it } from 'vitest'
import { fehlendePflichtfelder } from './pflichtfelder'
import { beispielVergleich } from './beispiel'
import { leererVergleich } from './types'

describe('fehlendePflichtfelder (Vergleich)', () => {
  it('ist leer für die Beispieldaten', () => {
    expect(fehlendePflichtfelder(beispielVergleich('2026-09-10'))).toEqual([])
  })
  it('listet alle Lücken einer leeren Vorlage mit deutschen Bezeichnungen', () => {
    const fehlt = fehlendePflichtfelder(leererVergleich('2026-09-10', 'AE-1', { name: '', rolle: '', telefon: '', email: '' }))
    expect(fehlt).toEqual([
      'Kunde (Firma oder Nachname)',
      'Anschrift des Kunden',
      'Anschrift der Lieferstelle',
      'Jahresverbrauch',
      'Lieferbeginn',
      'Versorger (Empfehlung)',
      'Arbeitspreis (Empfehlung)',
      'Versorger (aktueller Tarif)',
      'Arbeitspreis (aktueller Tarif)',
    ])
  })
  it('akzeptiert Privatkunden ohne Firma, verlangt Laufzeit ≥ 1', () => {
    const d = beispielVergleich('2026-09-10')
    d.kunde.firma = ''
    d.kunde.nachname = 'Muster'
    d.lieferstelle.laufzeitMonate = '0'
    expect(fehlendePflichtfelder(d)).toEqual(['Laufzeit'])
  })
})
