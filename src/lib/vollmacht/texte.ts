import { datum } from '../format'
import type { Energiearten, VollmachtDaten } from './types'

export function energieartenText(e: Energiearten): string {
  if (e.strom && e.gas) return 'Strom und Gas'
  if (e.strom) return 'Strom'
  if (e.gas) return 'Gas'
  return 'Energie'
}

export function versorgungText(e: Energiearten): string {
  if (e.strom && e.gas) return 'Strom- und Gasversorgung'
  if (e.strom) return 'Stromversorgung'
  if (e.gas) return 'Gasversorgung'
  return 'Energieversorgung'
}

export function bevollmaechtigungsSatz(d: VollmachtDaten): string {
  const wir = d.vollmachtgeber.typ === 'unternehmen'
  return (
    `Hiermit ${wir ? 'bevollmächtigen wir' : 'bevollmächtige ich'} (nachfolgend „Vollmachtgeber“) die vorstehend genannte Bevollmächtigte, ` +
    `${wir ? 'uns' : 'mich'} in allen Angelegenheiten der Versorgung mit ${energieartenText(d.energiearten)} für die nachfolgend aufgeführten ` +
    'Lieferstellen gegenüber Energieversorgungsunternehmen, Netzbetreibern und Messstellenbetreibern zu vertreten.'
  )
}

export function umfangPunkte(d: VollmachtDaten): string[] {
  return [
    'die Einholung von Auskünften und Unterlagen bei bisherigen und künftigen Energieversorgern, Netzbetreibern und Messstellenbetreibern, insbesondere zu Vertragsdaten, Laufzeiten, Kündigungsfristen, Verbrauchsdaten, Zählerständen und Rechnungen;',
    `die Einholung, den Vergleich und die Verhandlung von Angeboten für die Lieferung von ${energieartenText(d.energiearten)};`,
    'den Abschluss von Energielieferverträgen für die genannten Lieferstellen im Namen des Vollmachtgebers einschließlich der Abgabe aller hierfür erforderlichen Erklärungen;',
    'die Kündigung bestehender Energielieferverträge sowie die Ausübung von Sonderkündigungs- und Widerrufsrechten;',
    'die Durchführung und Begleitung des Lieferantenwechsels einschließlich der An- und Abmeldung der Lieferstellen beim Netzbetreiber;',
    'die Prüfung von Rechnungen und Abschlägen, die Geltendmachung von Korrekturen, Rückerstattungen und Guthaben sowie die Beantragung einer Reduzierung der Konzessionsabgabe;',
    'die Entgegennahme von Korrespondenz und Vertragsunterlagen im Zusammenhang mit den vorgenannten Angelegenheiten.',
  ]
}

export function beschraenkungEinleitung(d: VollmachtDaten): string {
  return `Diese Vollmacht ist ausschließlich auf Angelegenheiten der ${versorgungText(d.energiearten)} der genannten Lieferstellen beschränkt. Sie berechtigt die Bevollmächtigte insbesondere nicht`
}

export const beschraenkungPunkte: readonly string[] = [
  'zum Abschluss von Verträgen anderer Art, etwa Kauf-, Werk-, Miet-, Darlehens- oder Finanzierungsverträgen – auch nicht über Photovoltaikanlagen oder Wärmepumpen;',
  'zur Eingehung von Zahlungsverpflichtungen des Vollmachtgebers, die über die Entgelte der abgeschlossenen Energielieferverträge hinausgehen;',
  'zur Verfügung über Bankkonten oder zur Erteilung von SEPA-Lastschriftmandaten – diese bleiben dem Vollmachtgeber vorbehalten;',
  'zur Vertretung in gerichtlichen Verfahren oder zur Abgabe von Schuldanerkenntnissen.',
]

export function untervollmachtSatz(d: VollmachtDaten): string {
  return d.untervollmacht
    ? 'Die Bevollmächtigte ist berechtigt, Untervollmacht zu erteilen.'
    : 'Die Bevollmächtigte darf sich zur Ausführung dieser Vollmacht ihrer Mitarbeitenden bedienen. Die Erteilung einer Untervollmacht an Dritte ist nicht gestattet.'
}

export function geltungSatz(d: VollmachtDaten, email: string): string {
  const dauer = d.geltung.art === 'befristet' ? `bis zum ${datum(d.geltung.bis)}` : 'unbefristet bis auf Widerruf'
  return (
    `Die Vollmacht gilt ab dem Datum der Unterzeichnung ${dauer}. Sie kann jederzeit ohne Angabe von Gründen in Textform ` +
    `(z. B. per E-Mail an ${email}) widerrufen werden. Mit Zugang des Widerrufs erlischt die Vollmacht; bis dahin vorgenommene Handlungen bleiben wirksam.`
  )
}

export function datenschutzSatz(web: string): string {
  return (
    'Der Vollmachtgeber ist damit einverstanden, dass die Bevollmächtigte die zur Ausführung dieser Vollmacht erforderlichen personenbezogenen Daten ' +
    '(insbesondere Name, Anschrift, Kontaktdaten, Zählernummern, Verbrauchs- und Vertragsdaten) verarbeitet und an die betreffenden Energieversorger, ' +
    `Netzbetreiber und Messstellenbetreiber übermittelt. Die Datenschutzhinweise der Bevollmächtigten (${web}/datenschutz) wurden zur Kenntnis genommen.`
  )
}

export const sonstigesSatz =
  'Eine Kopie oder ein Scan dieser Vollmacht gilt als Original. Sollte eine Bestimmung dieser Vollmacht unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.'
