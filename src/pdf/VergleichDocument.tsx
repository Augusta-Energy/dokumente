import { Document, Text, View } from '@react-pdf/renderer'
import type { Absender } from '../lib/absender'
import { pdfDateiname } from '../lib/dateiname'
import { ctProKwh, datum, euro, grundpreisText, kwh, LEER, monate, prozent } from '../lib/format'
import { berechneVergleich, brutto, type VergleichErgebnis } from '../lib/vergleich/berechnung'
import { energieartLabel, kundenname, type Preisdarstellung, type VergleichDaten } from '../lib/vergleich/types'
import { parseDezimal } from '../lib/zahl'
import { GROESSE, styles } from './theme'
import { HighlightBlock } from './components/HighlightBlock'
import { KeyValueGrid, type KeyValue } from './components/KeyValueGrid'
import { PageFrame } from './components/PageFrame'
import { Tabelle, type TabellenZeile } from './components/Tabelle'
import { Absatz, ColonLead, Fussnoten, SectionTitle, Ueberschrift } from './components/Typo'

type Props = { daten: VergleichDaten; absender: Absender }

const VORTEILE: ReadonlyArray<[string, string]> = [
  ['Optimierte Konditionen', 'Durch die strukturierte, datenbasierte Ausschreibung zeigen wir Ihnen die besten Konditionen und Einsparpotenziale auf.'],
  ['Flexible Anpassung', 'Unser Angebot ist modular aufgebaut und lässt sich an veränderte Marktbedingungen oder Ihre Wünsche anpassen.'],
  ['Nachhaltige Beschaffung', 'Effizienz und Nachhaltigkeit behalten wir bei der Beschaffung ebenso im Blick wie den Preis.'],
]

const LEISTUNGEN: ReadonlyArray<[string, string]> = [
  ['Anbieterwechsel', 'Wir kümmern uns um einen reibungslosen Wechsel und alle dafür nötigen Schritte.'],
  ['Rechnungsprüfung', 'Wir prüfen alle eingehenden Rechnungen und veranlassen notwendige Korrekturen.'],
  ['Reduktion der Konzessionsabgabe', 'Sofern die gesetzlichen Voraussetzungen erfüllt sind, reduzieren wir Ihre Konzessionsabgabe.'],
  ['Forderungsmanagement', 'Zu viel gezahlte Abschläge fordern wir vom Versorger für Sie ein, wenn es dort zu Verzögerungen kommt.'],
  ['Nachverhandlung', 'Fallen die Energiepreise erheblich, verhandeln wir bestehende Verträge zu Ihren Gunsten neu.'],
  ['Laufende Vertragsbetreuung', 'Wir kümmern uns rechtzeitig vor Ablauf Ihrer Preisgarantie um den nächsten Wechsel.'],
]

const oder = (s: string) => (s.trim() === '' ? LEER : s.trim())

export function vergleichDateiname(d: VergleichDaten): string {
  return pdfDateiname('Energie-Vergleich', kundenname(d), d.vergleich.datum)
}

function anredeZeile(d: VergleichDaten): string {
  const { anrede, vorname, nachname } = d.kunde
  const name = `${vorname} ${nachname}`.trim()
  if (anrede === 'frau') return `Sehr geehrte Frau ${nachname.trim()},`
  if (anrede === 'herr') return `Sehr geehrter Herr ${nachname.trim()},`
  if (anrede === 'divers') return `Guten Tag ${name},`
  return 'Sehr geehrte Damen und Herren,'
}

function adresszeilen(d: VergleichDaten): string[] {
  const firma = d.kunde.firma.trim()
  const name = `${d.kunde.vorname} ${d.kunde.nachname}`.trim()
  const zeilen: string[] = []
  if (firma) {
    zeilen.push(firma)
    if (name) zeilen.push(`z. Hd. ${name}`)
  } else if (name) {
    zeilen.push(name)
  }
  if (d.kunde.strasse.trim()) zeilen.push(d.kunde.strasse.trim())
  const ort = `${d.kunde.plz} ${d.kunde.ort}`.trim()
  if (ort) zeilen.push(ort)
  return zeilen
}

function lieferstelleText(d: VergleichDaten): string {
  const teile = [d.lieferstelle.strasse.trim(), `${d.lieferstelle.plz} ${d.lieferstelle.ort}`.trim()].filter(Boolean)
  return teile.length ? teile.join(', ') : LEER
}

function lieferstelleEintraege(d: VergleichDaten, e: VergleichErgebnis): KeyValue[] {
  return [
    { label: 'Lieferstelle', wert: lieferstelleText(d) },
    { label: 'Energieart', wert: energieartLabel[d.lieferstelle.energieart] },
    { label: 'Jahresverbrauch', wert: kwh(parseDezimal(d.lieferstelle.jahresverbrauchKwh)) },
    { label: 'Lieferbeginn', wert: datum(d.lieferstelle.lieferbeginn) },
    { label: 'Lieferende', wert: datum(e.lieferende) },
    { label: 'Laufzeit', wert: e.laufzeitMonate > 0 ? monate(e.laufzeitMonate) : LEER },
  ]
}

/** Kompakte Ein-Zeilen-Variante (drei Einträge) für Seite 3 – dort ist der Platz knapp, Seite 2 zeigt das volle Raster. */
function lieferstelleEintraegeKompakt(d: VergleichDaten, e: VergleichErgebnis): KeyValue[] {
  return [
    { label: 'Lieferstelle', wert: `${lieferstelleText(d)} · ${energieartLabel[d.lieferstelle.energieart]}` },
    { label: 'Jahresverbrauch', wert: kwh(parseDezimal(d.lieferstelle.jahresverbrauchKwh)) },
    { label: 'Belieferung', wert: `${datum(d.lieferstelle.lieferbeginn)} – ${datum(e.lieferende)} · ${e.laufzeitMonate > 0 ? monate(e.laufzeitMonate) : LEER}` },
  ]
}

function fussnotenBasis(e: VergleichErgebnis, p: Preisdarstellung): string[] {
  return [
    `* Alle Preise verstehen sich ${p === 'netto' ? 'netto zzgl.' : 'inkl.'} der gesetzlichen Umsatzsteuer (${prozent(e.ustSatz)}).`,
    '** Gerundete Werte auf Basis des angegebenen Jahresverbrauchs. Bei starken Verbrauchsschwankungen können die tatsächlichen Kosten deutlich abweichen.',
    'Alle Werte sind auf zwei Nachkommastellen gerundet.',
  ]
}

/** Seite 3: die zweite und dritte Basis-Fußnote zu einer Zeile zusammengefasst, um Platz zu sparen. */
function fussnotenKompakt(e: VergleichErgebnis, p: Preisdarstellung): string[] {
  const [preishinweis] = fussnotenBasis(e, p)
  return [
    preishinweis,
    '** Gerundete Werte auf Basis des angegebenen Jahresverbrauchs; bei starken Verbrauchsschwankungen können die tatsächlichen Kosten deutlich abweichen. Alle Werte sind auf zwei Nachkommastellen gerundet.',
  ]
}

function MetaZeile({ label, wert }: { label: string; wert: string }) {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 2 }}>
      <Text style={[styles.label, { width: 108, paddingRight: 8, paddingTop: 1.5 }]}>{label}</Text>
      <Text style={{ flex: 1, fontSize: GROESSE.klein }}>{wert}</Text>
    </View>
  )
}

export function VergleichDocument({ daten, absender }: Props) {
  const e = berechneVergleich(daten)
  const p = daten.vergleich.preisdarstellung
  const w = (netto: number) => (p === 'brutto' ? brutto(netto, e.faktorUst) : netto)
  const b = (netto: number) => brutto(netto, e.faktorUst)
  const name = kundenname(daten) || LEER
  const nummer = oder(daten.vergleich.nummer)
  const laufzeile = `Energie-Vergleich Nr. ${nummer} vom ${datum(daten.vergleich.datum)} für ${name}`
  const laufzeitText = e.laufzeitMonate > 0 ? monate(e.laufzeitMonate) : 'Laufzeit'
  const honorarHinweis = e.honorarSichtbar ? ' – hierfür erheben wir das auf Seite 3 ausgewiesene Beratungshonorar.' : '.'

  const vergleichZeilen: TabellenZeile[] = [
    { zellen: ['Versorger', oder(daten.empfehlung.versorger), oder(daten.aktuell.versorger)] },
    { zellen: ['Preisgarantie', oder(daten.empfehlung.preisgarantie), oder(daten.aktuell.preisgarantie)] },
    { zellen: ['Arbeitspreis', ctProKwh(w(e.empfehlung.arbeitspreisCt)), ctProKwh(w(e.aktuell.arbeitspreisCt))] },
    {
      zellen: [
        'Grundpreis',
        grundpreisText(w(e.empfehlung.grundpreisEingabe), daten.empfehlung.grundpreisEinheit),
        grundpreisText(w(e.aktuell.grundpreisEingabe), daten.aktuell.grundpreisEinheit),
      ],
    },
    { zellen: ['Jahreskosten', euro(w(e.empfehlung.jahreskosten)), euro(w(e.aktuell.jahreskosten))] },
    { zellen: ['Monatlicher Abschlag', euro(w(e.empfehlung.abschlagMonat)), euro(w(e.aktuell.abschlagMonat))] },
    { zellen: ['Ersparnis pro Jahr', euro(w(e.ersparnisJahr)), LEER], fett: true },
  ]

  const vertragZeilen: TabellenZeile[] = [
    { zellen: ['Energieversorger', oder(daten.empfehlung.versorger)], span: true },
    { zellen: ['Preisgarantie', oder(daten.empfehlung.preisgarantie)], span: true },
    { zellen: ['Arbeitspreis', ctProKwh(e.empfehlung.arbeitspreisCt), ctProKwh(b(e.empfehlung.arbeitspreisCt))] },
    {
      zellen: [
        'Grundpreis',
        grundpreisText(e.empfehlung.grundpreisEingabe, daten.empfehlung.grundpreisEinheit),
        grundpreisText(b(e.empfehlung.grundpreisEingabe), daten.empfehlung.grundpreisEinheit),
      ],
    },
    { zellen: [`Gesamtkosten Laufzeit (${laufzeitText})`, euro(e.empfehlung.laufzeitkosten), euro(b(e.empfehlung.laufzeitkosten))] },
    { zellen: ['Monatlicher Abschlag', euro(e.empfehlung.abschlagMonat), euro(b(e.empfehlung.abschlagMonat))] },
  ]

  const honorarZeilen: TabellenZeile[] = [
    ...(e.honorarAnbieterwechsel > 0 ? [{ zellen: ['Honorar Anbieterwechsel', euro(e.honorarAnbieterwechsel), euro(b(e.honorarAnbieterwechsel))] }] : []),
    ...(e.honorarKonzessionsabgabe > 0 ? [{ zellen: ['Honorar Konzessionsabgabe', euro(e.honorarKonzessionsabgabe), euro(b(e.honorarKonzessionsabgabe))] }] : []),
    { zellen: ['Summe Beratungshonorar', euro(e.honorarSumme), euro(b(e.honorarSumme))], fett: true },
  ]

  const ersparnisZeilen: TabellenZeile[] = [
    { zellen: [`Ersparnis Anbieterwechsel (${laufzeitText})`, euro(e.ersparnisLaufzeit), euro(b(e.ersparnisLaufzeit))] },
    ...(e.kaReduktionLaufzeit > 0
      ? [{ zellen: [`Reduktion Konzessionsabgabe (${laufzeitText})`, euro(e.kaReduktionLaufzeit), euro(b(e.kaReduktionLaufzeit))] }]
      : []),
    ...(e.honorarSichtbar ? [{ zellen: ['abzüglich Beratungshonorar', euro(-e.honorarSumme), euro(-b(e.honorarSumme))] }] : []),
    { zellen: ['Gesamtersparnis', euro(e.gesamtersparnisLaufzeit), euro(b(e.gesamtersparnisLaufzeit))], fett: true },
  ]

  const nettoBruttoSpalten = [
    { label: '', flex: 2.4 },
    { label: 'netto', align: 'right' as const, hervorgehoben: p === 'netto' },
    { label: 'brutto', align: 'right' as const, hervorgehoben: p === 'brutto' },
  ]

  const keineErsparnis = 'Mit unserer Empfehlung ergibt sich derzeit keine Ersparnis gegenüber Ihrem aktuellen Tarif.'

  return (
    <Document
      title={`Energie-Vergleich ${nummer}`}
      author={absender.firma}
      subject={`Energie-Vergleich für ${name}`}
      language="de"
      creator="Augusta Energy Dokumente"
      producer="Augusta Energy Dokumente"
    >
      {/* Seite 1 – Anschreiben */}
      <PageFrame absender={absender}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
          <View style={{ width: '52%' }}>
            <Text style={[styles.fussnote, { marginBottom: 4 }]}>{`${absender.firma} · ${absender.strasse} · ${absender.plz} ${absender.ort}`}</Text>
            {adresszeilen(daten).map((zeile, i) => (
              <Text key={i} style={{ fontSize: GROESSE.text, lineHeight: 1.4 }}>{zeile}</Text>
            ))}
          </View>
          <View style={{ width: '42%' }}>
            <MetaZeile label="Vergleichsnummer" wert={nummer} />
            <MetaZeile label="Datum" wert={datum(daten.vergleich.datum)} />
            <MetaZeile label="Gültig bis" wert={datum(e.gueltigBis)} />
            <MetaZeile label="Ansprechpartner" wert={absender.ansprechpartner.name} />
            {/* Fester Zeilenumbruch vor dem Punkt: Die Werte-Spalte ist zu schmal für „Telefon · E-Mail“ in einer
                Zeile. Ohne harten Umbruch bricht react-pdf hinter dem Punkt um und lässt ihn am Zeilenende hängen. */}
            <MetaZeile label="Kontakt" wert={`${absender.ansprechpartner.telefon}\n· ${absender.ansprechpartner.email}`} />
          </View>
        </View>

        <SectionTitle eyebrow={`${energieartLabel[daten.lieferstelle.energieart]} · ${lieferstelleText(daten)}`} titel="Ihr persönlicher Energie-Vergleich" />

        <Absatz>{anredeZeile(daten)}</Absatz>
        <Absatz>
          vielen Dank für Ihr Vertrauen. Auf Grundlage Ihrer Verbrauchsdaten haben wir den Markt für Sie ausgeschrieben und ein Einkaufsmodell entwickelt, das auf Ihre Anforderungen zugeschnitten ist. Das Ergebnis finden Sie auf den folgenden Seiten – zunächst im Überblick, anschließend im Detail.
        </Absatz>

        <Ueberschrift>Das bietet Ihnen unser Einkaufsmodell</Ueberschrift>
        {VORTEILE.map(([lead, text]) => (
          <ColonLead key={lead} lead={lead} text={text} />
        ))}

        <Ueberschrift>Unsere Leistungen für Sie</Ueberschrift>
        <Absatz>{`Diese Leistungen sind Bestandteil unseres Vergleichs${honorarHinweis}`}</Absatz>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {LEISTUNGEN.map(([lead, text]) => (
            <View key={lead} style={{ width: '50%', paddingRight: 12 }}>
              <ColonLead lead={lead} text={text} />
            </View>
          ))}
        </View>

        <Absatz abstand={4}>Wir freuen uns auf Ihre Beauftragung und stehen Ihnen bei Fragen jederzeit zur Verfügung.</Absatz>
        <Absatz>Mit freundlichen Grüßen</Absatz>
        <Text style={[styles.fett, { marginTop: 10, fontSize: GROESSE.text }]}>{oder(daten.unterzeichner.name)}</Text>
        <Text style={styles.klein}>{`${oder(daten.unterzeichner.rolle)} · ${absender.firma}`}</Text>
      </PageFrame>

      {/* Seite 2 – Überblick */}
      <PageFrame absender={absender} laufzeile={laufzeile}>
        <SectionTitle titel="Ihr Vergleich auf einen Blick" />
        <KeyValueGrid spalten={3} eintraege={lieferstelleEintraege(daten, e)} />
        <Text style={[styles.klein, { marginTop: 6, marginBottom: 4 }]}>{`Alle Preise ${p}*`}</Text>
        <Tabelle
          spalten={[{ label: '', flex: 1.6 }, { label: 'Unsere Empfehlung', align: 'right', hervorgehoben: true }, { label: 'Ihr aktueller Tarif', align: 'right' }]}
          zeilen={vergleichZeilen}
        />
        {e.ersparnisJahr > 0 ? (
          <HighlightBlock text="Durch unsere Einkaufsstrategie sparen Sie jedes Jahr" wert={`${euro(w(e.ersparnisJahr))} ${p}*`} />
        ) : (
          <HighlightBlock text="Ihre Ersparnis" hinweis={keineErsparnis} />
        )}
        <Fussnoten zeilen={fussnotenBasis(e, p)} />
      </PageFrame>

      {/* Seite 3 – Details */}
      <PageFrame absender={absender} laufzeile={laufzeile} dicht>
        <SectionTitle eyebrow={`Vergleichskonditionen vom ${datum(daten.vergleich.datum)} · gültig bis ${datum(e.gueltigBis)}`} titel="Konditionen im Detail" />
        <KeyValueGrid spalten={3} eintraege={lieferstelleEintraegeKompakt(daten, e)} />

        <Ueberschrift>Vertragsdetails – unsere Empfehlung</Ueberschrift>
        <Tabelle spalten={nettoBruttoSpalten} zeilen={vertragZeilen} />

        {e.honorarSichtbar ? (
          <>
            <Ueberschrift>Beratungshonorar</Ueberschrift>
            <Tabelle spalten={nettoBruttoSpalten} zeilen={honorarZeilen} />
          </>
        ) : null}

        <Ueberschrift>Ihr Einsparpotenzial über die Laufzeit</Ueberschrift>
        <Tabelle spalten={nettoBruttoSpalten} zeilen={ersparnisZeilen} />

        {e.gesamtersparnisLaufzeit > 0 ? (
          <HighlightBlock text="Durch unseren Anbieterwechsel sparen Sie insgesamt" wert={`${euro(w(e.gesamtersparnisLaufzeit))} ${p}**`} />
        ) : (
          <HighlightBlock text="Ihre Gesamtersparnis" hinweis={keineErsparnis} />
        )}

        {daten.vergleich.hinweise.trim() ? (
          <>
            <Ueberschrift>Hinweise</Ueberschrift>
            <Absatz>{daten.vergleich.hinweise.trim()}</Absatz>
          </>
        ) : null}

        <Fussnoten
          zeilen={[
            ...fussnotenKompakt(e, p),
            'Dieses Angebot ist freibleibend. Grundlage sind die zum Vergleichsdatum gültigen Konditionen des Versorgers; Änderungen von Steuern, Abgaben und Umlagen bleiben vorbehalten.',
          ]}
        />
      </PageFrame>
    </Document>
  )
}
