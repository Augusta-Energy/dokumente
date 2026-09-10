import { beforeAll, describe, expect, it } from 'vitest'
import { Document, renderToBuffer } from '@react-pdf/renderer'
import { registerFonts } from '../../brand/fonts.node'
import { standardAbsender } from '../../lib/absender'
import { istPdf, seitenAnzahl } from '../testUtils'
import { HighlightBlock } from './HighlightBlock'
import { KeyValueGrid } from './KeyValueGrid'
import { fusszeilen, PageFrame } from './PageFrame'
import { Tabelle } from './Tabelle'
import { Absatz, ColonLead, Fussnoten, SectionTitle, Ueberschrift } from './Typo'

beforeAll(() => registerFonts())

describe('PDF-Grundgerüst', () => {
  it('bildet die Fußzeilen abhängig von optionalen Angaben', () => {
    expect(fusszeilen(standardAbsender)).toEqual([
      'Augusta Energy · Inhaber: Niklas Trojovsky · Am Mittleren Moos 53 · 86167 Augsburg',
      'Telefon 0151 41378008 · info@augusta-energy.de · augusta-energy.de',
    ])
    expect(fusszeilen({ ...standardAbsender, ustIdNr: 'DE123456789', bank: 'Musterbank', iban: 'DE00 1234' })).toEqual([
      'Augusta Energy · Inhaber: Niklas Trojovsky · Am Mittleren Moos 53 · 86167 Augsburg',
      'Telefon 0151 41378008 · info@augusta-energy.de · augusta-energy.de · USt-IdNr. DE123456789',
      'Bankverbindung: Musterbank · IBAN DE00 1234',
    ])
  })

  it('rendert eine Seite mit Kopf, Fuß, Tabelle und Highlight in den Markenschriften', async () => {
    const pdf = await renderToBuffer(
      <Document>
        <PageFrame absender={standardAbsender} laufzeile="Energie-Vergleich Nr. AE-1 vom 10.09.2026 für Test">
          <SectionTitle eyebrow="Strom · Musterstraße 12, 86150 Augsburg" titel="Ihr persönlicher Energie-Vergleich" />
          <Absatz>Umlaute ÄÖÜ äöü ß und € müssen sauber gesetzt werden.</Absatz>
          <Ueberschrift>Unsere Leistungen für Sie</Ueberschrift>
          <ColonLead lead="Anbieterwechsel" text="Wir kümmern uns um einen reibungslosen Wechsel." />
          <KeyValueGrid spalten={3} eintraege={[{ label: 'Energieart', wert: 'Strom' }, { label: 'Laufzeit', wert: '24 Monate' }, { label: 'Lieferbeginn', wert: '01.01.2027' }]} />
          <Tabelle
            spalten={[{ label: '', flex: 2 }, { label: 'Unsere Empfehlung', align: 'right', hervorgehoben: true }, { label: 'Ihr aktueller Tarif', align: 'right' }]}
            zeilen={[
              { zellen: ['Versorger', 'M4ENERGY', 'EnBW'] },
              { zellen: ['Preisgarantie', 'Energiepreisgarantie bis 31.12.2028'], span: true },
              { zellen: ['Jahreskosten', '16.436,36 €', '17.417,26 €'], fett: true },
            ]}
          />
          <HighlightBlock text="Durch unsere Einkaufsstrategie sparen Sie jedes Jahr" wert="980,90 € netto*" />
          <Fussnoten zeilen={['* Alle Preise netto.', '** Gerundete Werte.']} />
        </PageFrame>
      </Document>,
    )
    expect(istPdf(pdf)).toBe(true)
    expect(seitenAnzahl(pdf)).toBe(1)
    const roh = Buffer.from(pdf).toString('latin1')
    expect(roh).toMatch(/Montserrat/)
    expect(roh).toMatch(/Raleway/)
  })
})
