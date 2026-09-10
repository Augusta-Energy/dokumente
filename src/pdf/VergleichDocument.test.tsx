import { beforeAll, describe, expect, it } from 'vitest'
import { renderToBuffer } from '@react-pdf/renderer'
import { registerFonts } from '../brand/fonts.node'
import { standardAbsender } from '../lib/absender'
import { beispielVergleich } from '../lib/vergleich/beispiel'
import { leererVergleich } from '../lib/vergleich/types'
import { istPdf, seitenAnzahl } from './testUtils'
import { VergleichDocument, vergleichDateiname } from './VergleichDocument'

beforeAll(() => registerFonts())

describe('VergleichDocument', () => {
  it('rendert die Beispieldaten auf genau drei Seiten', async () => {
    const pdf = await renderToBuffer(<VergleichDocument daten={beispielVergleich('2026-09-10')} absender={standardAbsender} />)
    expect(istPdf(pdf)).toBe(true)
    expect(seitenAnzahl(pdf)).toBe(3)
  })
  it('bleibt bei ausgeblendetem Honorar, Brutto-Darstellung, Hinweisen und negativer Ersparnis bei drei Seiten', async () => {
    const d = beispielVergleich('2026-09-10')
    d.honorar.anzeigen = false
    d.vergleich.preisdarstellung = 'brutto'
    d.vergleich.hinweise = 'Der Wechsel erfolgt zum 01.01.2027. Bitte senden Sie uns die letzte Jahresabrechnung.'
    d.empfehlung.arbeitspreisCt = '40'
    d.kunde.anrede = 'frau'
    const pdf = await renderToBuffer(<VergleichDocument daten={d} absender={standardAbsender} />)
    expect(seitenAnzahl(pdf)).toBe(3)
  })
  it('rendert auch eine leere Vorlage ohne Fehler', async () => {
    const leer = leererVergleich('2026-09-10', 'AE-20260910-AAAA', standardAbsender.ansprechpartner)
    const pdf = await renderToBuffer(<VergleichDocument daten={leer} absender={standardAbsender} />)
    expect(seitenAnzahl(pdf)).toBe(3)
  })
  it('bildet den Dateinamen aus Kundenname und Datum', () => {
    expect(vergleichDateiname(beispielVergleich('2026-09-10'))).toBe('Augusta-Energy_Energie-Vergleich_Muster-Gastronomie-GmbH_2026-09-10.pdf')
  })
})
