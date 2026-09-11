import { describe, expect, it } from 'vitest'
import {
  beschraenkungEinleitung,
  beschraenkungPunkte,
  bevollmaechtigungsSatz,
  datenschutzSatz,
  energieartenText,
  geltungSatz,
  sonstigesSatz,
  umfangPunkte,
  untervollmachtSatz,
  versorgungText,
} from './texte'
import { leereVollmacht } from './types'

describe('Vollmacht-Texte', () => {
  it('benennt die Energiearten', () => {
    expect(energieartenText({ strom: true, gas: true })).toBe('Strom und Gas')
    expect(energieartenText({ strom: true, gas: false })).toBe('Strom')
    expect(energieartenText({ strom: false, gas: true })).toBe('Gas')
    expect(energieartenText({ strom: false, gas: false })).toBe('Energie')
    expect(versorgungText({ strom: true, gas: true })).toBe('Strom- und Gasversorgung')
    expect(versorgungText({ strom: true, gas: false })).toBe('Stromversorgung')
    expect(versorgungText({ strom: false, gas: true })).toBe('Gasversorgung')
    expect(versorgungText({ strom: false, gas: false })).toBe('Energieversorgung')
  })
  it('formuliert ich/wir je nach Vollmachtgeber-Typ', () => {
    const privat = leereVollmacht()
    expect(bevollmaechtigungsSatz(privat)).toContain('bevollmächtige ich')
    expect(bevollmaechtigungsSatz(privat)).toContain(' mich ')
    const firma = leereVollmacht()
    firma.vollmachtgeber.typ = 'unternehmen'
    expect(bevollmaechtigungsSatz(firma)).toContain('bevollmächtigen wir')
    expect(bevollmaechtigungsSatz(firma)).toContain(' uns ')
    expect(bevollmaechtigungsSatz(firma)).toContain('Versorgung mit Strom und Gas')
  })
  it('setzt die Energieart in Umfang und Beschränkung ein', () => {
    const d = leereVollmacht()
    d.energiearten = { strom: false, gas: true }
    const punkte = umfangPunkte(d)
    expect(punkte).toHaveLength(7)
    expect(punkte[1]).toContain('Lieferung von Gas')
    expect(beschraenkungEinleitung(d)).toContain('Gasversorgung')
  })
  it('formuliert Geltungsdauer und Untervollmacht', () => {
    const d = leereVollmacht()
    expect(geltungSatz(d, 'info@augusta-energy.de')).toContain('unbefristet bis auf Widerruf')
    expect(geltungSatz(d, 'info@augusta-energy.de')).toContain('per E-Mail an info@augusta-energy.de')
    d.geltung = { art: 'befristet', bis: '2027-12-31' }
    expect(geltungSatz(d, 'x@y.de')).toContain('bis zum 31.12.2027')
    expect(untervollmachtSatz(d)).toContain('nicht gestattet')
    d.untervollmacht = true
    expect(untervollmachtSatz(d)).toBe('Die Bevollmächtigte ist berechtigt, Untervollmacht zu erteilen.')
  })
  // Rechtlich geprüfter Wortlaut – die Literale hier sind absichtlich exakte Kopien aus texte.ts,
  // damit ein versehentlicher Textwechsel (auch nur ein Zeichen) den Test bricht.
  it('pinnt den rechtlich geprüften Wortlaut von Umfang, Beschränkung, Sonstiges und Datenschutz', () => {
    expect(umfangPunkte(leereVollmacht())).toEqual([
      'die Einholung von Auskünften und Unterlagen bei bisherigen und künftigen Energieversorgern, Netzbetreibern und Messstellenbetreibern, insbesondere zu Vertragsdaten, Laufzeiten, Kündigungsfristen, Verbrauchsdaten, Zählerständen und Rechnungen;',
      'die Einholung, den Vergleich und die Verhandlung von Angeboten für die Lieferung von Strom und Gas;',
      'den Abschluss von Energielieferverträgen für die genannten Lieferstellen im Namen des Vollmachtgebers einschließlich der Abgabe aller hierfür erforderlichen Erklärungen;',
      'die Kündigung bestehender Energielieferverträge sowie die Ausübung von Sonderkündigungs- und Widerrufsrechten;',
      'die Durchführung und Begleitung des Lieferantenwechsels einschließlich der An- und Abmeldung der Lieferstellen beim Netzbetreiber;',
      'die Prüfung von Rechnungen und Abschlägen, die Geltendmachung von Korrekturen, Rückerstattungen und Guthaben sowie die Beantragung einer Reduzierung der Konzessionsabgabe;',
      'die Entgegennahme von Korrespondenz und Vertragsunterlagen im Zusammenhang mit den vorgenannten Angelegenheiten.',
    ])
    expect(beschraenkungPunkte).toEqual([
      'zum Abschluss von Verträgen anderer Art, etwa Kauf-, Werk-, Miet-, Darlehens- oder Finanzierungsverträgen – auch nicht über Photovoltaikanlagen oder Wärmepumpen;',
      'zur Eingehung von Zahlungsverpflichtungen des Vollmachtgebers, die über die Entgelte der abgeschlossenen Energielieferverträge hinausgehen;',
      'zur Verfügung über Bankkonten oder zur Erteilung von SEPA-Lastschriftmandaten – diese bleiben dem Vollmachtgeber vorbehalten;',
      'zur Vertretung in gerichtlichen Verfahren oder zur Abgabe von Schuldanerkenntnissen.',
    ])
    expect(sonstigesSatz).toBe(
      'Eine Kopie oder ein Scan dieser Vollmacht gilt als Original. Sollte eine Bestimmung dieser Vollmacht unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.',
    )
    expect(datenschutzSatz('augusta-energy.de')).toBe(
      'Der Vollmachtgeber ist damit einverstanden, dass die Bevollmächtigte die zur Ausführung dieser Vollmacht erforderlichen personenbezogenen Daten ' +
        '(insbesondere Name, Anschrift, Kontaktdaten, Zählernummern, Verbrauchs- und Vertragsdaten) verarbeitet und an die betreffenden Energieversorger, ' +
        'Netzbetreiber und Messstellenbetreiber übermittelt. Die Datenschutzhinweise der Bevollmächtigten (augusta-energy.de/datenschutz) wurden zur Kenntnis genommen.',
    )
  })
})
