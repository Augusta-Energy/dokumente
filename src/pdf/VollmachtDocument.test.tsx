import { beforeAll, describe, expect, it } from 'vitest'
import { renderToBuffer } from '@react-pdf/renderer'
import { registerFonts } from '../brand/fonts.node'
import { standardAbsender } from '../lib/absender'
import { beispielVollmacht } from '../lib/vollmacht/beispiel'
import { leereVollmacht, neueLieferstelle } from '../lib/vollmacht/types'
import { istPdf, seitenAnzahl } from './testUtils'
import { VollmachtDocument, vollmachtDateiname } from './VollmachtDocument'

beforeAll(() => registerFonts())

describe('VollmachtDocument', () => {
  it('rendert die Beispieldaten auf höchstens zwei Seiten', async () => {
    const pdf = await renderToBuffer(<VollmachtDocument daten={beispielVollmacht()} absender={standardAbsender} />)
    expect(istPdf(pdf)).toBe(true)
    expect(seitenAnzahl(pdf)).toBeLessThanOrEqual(2)
  })
  it('läuft bei vielen Lieferstellen auf weitere Seiten über, ohne zu brechen', async () => {
    const d = beispielVollmacht()
    d.lieferstellen = Array.from({ length: 12 }, (_, i) => ({ ...neueLieferstelle(), adresse: `Teststraße ${i + 1}, 86150 Augsburg`, zaehlernummer: `Z${i}` }))
    const pdf = await renderToBuffer(<VollmachtDocument daten={d} absender={standardAbsender} />)
    expect(seitenAnzahl(pdf)).toBeGreaterThanOrEqual(2)
  })
  it('rendert Privatperson, Befristung und Untervollmacht sowie die leere Vorlage', async () => {
    const d = beispielVollmacht()
    d.vollmachtgeber = { ...d.vollmachtgeber, typ: 'privat', name: 'Erika Musterfrau', vertretenDurch: '', geburtsdatum: '1980-05-17' }
    d.geltung = { art: 'befristet', bis: '2027-12-31' }
    d.untervollmacht = true
    d.unterschrift = { ort: 'Augsburg', datum: '2026-09-10' }
    expect(seitenAnzahl(await renderToBuffer(<VollmachtDocument daten={d} absender={standardAbsender} />))).toBeLessThanOrEqual(2)
    expect(seitenAnzahl(await renderToBuffer(<VollmachtDocument daten={leereVollmacht()} absender={standardAbsender} />))).toBeGreaterThanOrEqual(1)
  })
  it('bildet den Dateinamen aus Vollmachtgeber und Datum', () => {
    const d = beispielVollmacht()
    d.unterschrift.datum = '2026-09-10'
    expect(vollmachtDateiname(d)).toBe('Augusta-Energy_Vollmacht_Muster-Gastronomie-GmbH_2026-09-10.pdf')
  })
})
