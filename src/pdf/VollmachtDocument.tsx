import { Document, Text, View } from '@react-pdf/renderer'
import { farben } from '../brand/colors'
import type { Absender } from '../lib/absender'
import { pdfDateiname } from '../lib/dateiname'
import { heuteIso } from '../lib/datum'
import { datum, LEER } from '../lib/format'
import { beschraenkungEinleitung, beschraenkungPunkte, bevollmaechtigungsSatz, datenschutzSatz, energieartenText, geltungSatz, sonstigesSatz, umfangPunkte, untervollmachtSatz } from '../lib/vollmacht/texte'
import { lieferstellenEnergieartLabel, vollmachtgeberName, type VollmachtDaten } from '../lib/vollmacht/types'
import { GROESSE, styles } from './theme'
import { PageFrame } from './components/PageFrame'
import { Tabelle } from './components/Tabelle'
import { Absatz, SectionTitle, Ueberschrift } from './components/Typo'

type Props = { daten: VollmachtDaten; absender: Absender }

const oder = (s: string) => (s.trim() === '' ? LEER : s.trim())

export function vollmachtDateiname(d: VollmachtDaten): string {
  return pdfDateiname('Vollmacht', vollmachtgeberName(d), d.unterschrift.datum.trim() || heuteIso())
}

function Box({ titel, zeilen }: { titel: string; zeilen: string[] }) {
  return (
    <View style={{ flex: 1, backgroundColor: farben.cream, padding: 10 }}>
      <Text style={[styles.label, { marginBottom: 4 }]}>{titel}</Text>
      {zeilen.map((z, i) => (
        <Text key={i} style={{ fontSize: GROESSE.text, lineHeight: 1.4, fontWeight: i === 0 ? 600 : 400 }}>{z}</Text>
      ))}
    </View>
  )
}

function Liste({ punkte, nummeriert }: { punkte: readonly string[]; nummeriert: boolean }) {
  return (
    <View style={{ marginBottom: 4 }}>
      {punkte.map((punkt, i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 2.5 }}>
          <Text style={{ width: 16, color: farben.goldDeep, fontWeight: 600 }}>{nummeriert ? `${i + 1}.` : '–'}</Text>
          <Text style={{ flex: 1 }}>{punkt}</Text>
        </View>
      ))}
    </View>
  )
}

export function VollmachtDocument({ daten, absender }: Props) {
  const vg = daten.vollmachtgeber
  const vollmachtgeberZeilen = [
    oder(vg.name),
    vg.typ === 'unternehmen' && vg.vertretenDurch.trim() ? `vertreten durch ${vg.vertretenDurch.trim()}` : '',
    vg.strasse.trim(),
    `${vg.plz} ${vg.ort}`.trim(),
    vg.typ === 'privat' && vg.geburtsdatum.trim() ? `geb. am ${datum(vg.geburtsdatum)}` : '',
    vg.email.trim(),
    vg.telefon.trim(),
  ].filter(Boolean)

  const bevollmaechtigteZeilen = [
    absender.firma,
    `Inhaber: ${absender.inhaber}`,
    absender.strasse,
    `${absender.plz} ${absender.ort}`,
    `Telefon ${absender.telefon} · ${absender.email}`,
  ]

  const lieferstellenZeilen = daten.lieferstellen.map((l, i) => ({
    zellen: [`${i + 1}`, oder(l.adresse), lieferstellenEnergieartLabel[l.energieart], oder(l.zaehlernummer), oder(l.maloId), oder(l.versorger)],
  }))

  const ort = daten.unterschrift.ort.trim() || vg.ort.trim()
  const tag = daten.unterschrift.datum.trim() ? datum(daten.unterschrift.datum) : ''
  const ortDatum = ort ? (tag ? `${ort}, ${tag}` : `${ort}, `) : tag

  return (
    <Document title={`Vollmacht ${vollmachtgeberName(daten)}`.trim()} author={absender.firma} subject="Vollmacht Energieversorgung" language="de" creator="Augusta Energy Dokumente" producer="Augusta Energy Dokumente">
      <PageFrame absender={absender}>
        <SectionTitle eyebrow={`Energieversorgung · ${energieartenText(daten.energiearten)}`} titel="Vollmacht" />

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <Box titel="Vollmachtgeber/in" zeilen={vollmachtgeberZeilen} />
          <Box titel="Bevollmächtigte" zeilen={bevollmaechtigteZeilen} />
        </View>

        <Absatz>{bevollmaechtigungsSatz(daten)}</Absatz>

        <Ueberschrift>Lieferstellen</Ueberschrift>
        <Tabelle
          spalten={[
            { label: 'Nr.', flex: 0.35 },
            { label: 'Adresse', flex: 1.9 },
            { label: 'Energieart', flex: 1.2 },
            { label: 'Zählernummer', flex: 1.5 },
            { label: 'MaLo-ID', flex: 1.2 },
            { label: 'Bisheriger Versorger', flex: 1.25 },
          ]}
          zeilen={lieferstellenZeilen.length ? lieferstellenZeilen : [{ zellen: ['1', LEER, LEER, LEER, LEER, LEER] }]}
        />

        <Ueberschrift>Umfang der Vollmacht</Ueberschrift>
        <Absatz abstand={3}>Die Vollmacht umfasst insbesondere:</Absatz>
        <Liste punkte={umfangPunkte(daten)} nummeriert />

        <Ueberschrift>Beschränkung der Vollmacht</Ueberschrift>
        <Absatz abstand={3}>{beschraenkungEinleitung(daten)}</Absatz>
        <Liste punkte={beschraenkungPunkte} nummeriert={false} />

        <Ueberschrift>Untervollmacht</Ueberschrift>
        <Absatz>{untervollmachtSatz(daten)}</Absatz>

        <Ueberschrift>Geltungsdauer und Widerruf</Ueberschrift>
        <Absatz>{geltungSatz(daten, absender.email)}</Absatz>

        <Ueberschrift>Datenschutz</Ueberschrift>
        <Absatz>{datenschutzSatz(absender.web)}</Absatz>

        <Ueberschrift>Sonstiges</Ueberschrift>
        <Absatz>{sonstigesSatz}</Absatz>

        <View wrap={false} style={{ flexDirection: 'row', gap: 28, marginTop: 26 }}>
          <View style={{ flex: 1 }}>
            <View style={{ height: 30, justifyContent: 'flex-end', borderBottomWidth: 1, borderBottomColor: farben.ink, paddingBottom: 3 }}>
              <Text>{ortDatum}</Text>
            </View>
            <Text style={[styles.label, { marginTop: 4 }]}>Ort, Datum</Text>
          </View>
          <View style={{ flex: 1.3 }}>
            <View style={{ height: 30, borderBottomWidth: 1, borderBottomColor: farben.ink }} />
            <Text style={[styles.label, { marginTop: 4 }]}>Unterschrift Vollmachtgeber/in</Text>
            <Text style={{ fontSize: GROESSE.fussnote, color: farben.muted, marginTop: 2 }}>bei Unternehmen: Name in Druckbuchstaben, Funktion, ggf. Firmenstempel</Text>
          </View>
        </View>
      </PageFrame>
    </Document>
  )
}
