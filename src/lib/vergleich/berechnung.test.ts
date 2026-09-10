import { describe, expect, it } from 'vitest'
import { berechneVergleich, brutto } from './berechnung'
import { leererVergleich, type VergleichDaten } from './types'

function beispiel(): VergleichDaten {
  const d = leererVergleich('2025-04-10', 'AE-20250410-TEST', { name: 'N', rolle: 'R', telefon: '', email: '' })
  d.lieferstelle.jahresverbrauchKwh = '53416'
  d.lieferstelle.lieferbeginn = '2026-01-01'
  d.lieferstelle.laufzeitMonate = '24'
  d.empfehlung = { versorger: 'M4ENERGY', preisgarantie: 'Energiepreisgarantie', arbeitspreisCt: '30,54', grundpreis: '123,11', grundpreisEinheit: 'jahr' }
  d.aktuell = { versorger: 'EnBW', preisgarantie: 'Oft bereits abgelaufen', arbeitspreisCt: '32,44', grundpreis: '89,11', grundpreisEinheit: 'jahr' }
  d.honorar = { anzeigen: true, anbieterwechsel: '49,00', konzessionsabgabe: '320,50' }
  d.konzessionsabgabe.reduktionProJahr = '794,83'
  return d
}

describe('berechneVergleich', () => {
  it('reproduziert das Beispiel aus dem Konkurrenz-PDF (±0,02 €)', () => {
    const e = berechneVergleich(beispiel())
    expect(e.laufzeitMonate).toBe(24)
    expect(e.lieferende).toBe('2027-12-31')
    expect(e.gueltigBis).toBe('2025-04-13')
    expect(e.empfehlung.jahreskosten).toBeCloseTo(16436.36, 2)
    expect(e.aktuell.jahreskosten).toBeCloseTo(17417.26, 2)
    expect(e.ersparnisJahr).toBeCloseTo(980.9, 2)
    expect(brutto(e.empfehlung.abschlagMonat, e.faktorUst)).toBeCloseTo(1629.94, 1)
    expect(brutto(e.aktuell.abschlagMonat, e.faktorUst)).toBeCloseTo(1727.21, 1)
    expect(e.empfehlung.laufzeitkosten).toBeCloseTo(32872.72, 1)
    expect(brutto(e.empfehlung.laufzeitkosten, e.faktorUst)).toBeCloseTo(39118.54, 1)
    expect(e.honorarSumme).toBeCloseTo(369.5, 2)
    expect(e.ersparnisLaufzeit).toBeCloseTo(1961.8, 1)
    expect(e.kaReduktionLaufzeit).toBeCloseTo(1589.66, 1)
    expect(e.gesamtersparnisLaufzeit).toBeCloseTo(3181.96, 1)
    expect(brutto(e.gesamtersparnisLaufzeit, e.faktorUst)).toBeCloseTo(3786.53, 1)
  })
  it('rechnet monatlichen Grundpreis aufs Jahr hoch', () => {
    const d = beispiel()
    d.empfehlung.grundpreis = '10'
    d.empfehlung.grundpreisEinheit = 'monat'
    const e = berechneVergleich(d)
    expect(e.empfehlung.grundpreisJahr).toBe(120)
    expect(e.empfehlung.jahreskosten).toBeCloseTo(0.3054 * 53416 + 120, 6)
  })
  it('lässt ausgeblendetes Honorar aus der Gesamtersparnis heraus', () => {
    const d = beispiel()
    d.honorar.anzeigen = false
    const e = berechneVergleich(d)
    expect(e.honorarSichtbar).toBe(false)
    expect(e.honorarSumme).toBe(0)
    expect(e.gesamtersparnisLaufzeit).toBeCloseTo(1961.8 + 1589.66, 1)
  })
  it('meldet Honorar als unsichtbar, wenn beide Beträge leer sind', () => {
    const d = beispiel()
    d.honorar = { anzeigen: true, anbieterwechsel: '', konzessionsabgabe: '' }
    expect(berechneVergleich(d).honorarSichtbar).toBe(false)
  })
  it('liefert negative Ersparnis, wenn die Empfehlung teurer ist', () => {
    const d = beispiel()
    d.empfehlung.arbeitspreisCt = '40'
    expect(berechneVergleich(d).ersparnisJahr).toBeLessThan(0)
  })
  it('kommt mit leeren Eingaben zurecht (alles 0, keine NaN)', () => {
    const e = berechneVergleich(leererVergleich('2026-09-10', 'AE-1', { name: '', rolle: '', telefon: '', email: '' }))
    expect(e.empfehlung.jahreskosten).toBe(0)
    expect(e.gesamtersparnisLaufzeit).toBe(0)
    expect(e.lieferende).toBeNull()
    expect(Number.isNaN(e.ersparnisJahr)).toBe(false)
  })
})
