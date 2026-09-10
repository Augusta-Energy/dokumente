import { describe, expect, it } from 'vitest'
import { pdfDateiname, slug } from './dateiname'

describe('dateiname', () => {
  it('bildet Slugs mit Umlaut-Umschrift', () => {
    expect(slug('Müller & Söhne GmbH')).toBe('Mueller-Soehne-GmbH')
    expect(slug('Trattoria da Schnecki')).toBe('Trattoria-da-Schnecki')
    expect(slug('Ärztehaus Straße 3')).toBe('Aerztehaus-Strasse-3')
    expect(slug('  ')).toBe('Dokument')
    expect(slug('Café Ñandú')).toBe('Cafe-Nandu')
  })
  it('baut den PDF-Dateinamen', () => {
    expect(pdfDateiname('Energie-Vergleich', 'Muster Gastronomie GmbH', '2026-09-10')).toBe(
      'Augusta-Energy_Energie-Vergleich_Muster-Gastronomie-GmbH_2026-09-10.pdf',
    )
    expect(pdfDateiname('Vollmacht', '', '2026-09-10')).toBe('Augusta-Energy_Vollmacht_Dokument_2026-09-10.pdf')
  })
})
