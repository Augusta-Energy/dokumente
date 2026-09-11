import { describe, expect, it } from 'vitest'
import { dateiBasis, pdfDateiname, pngDateiname, svgDateiname } from './dateiname'

describe('Dateinamen der Visitenkarten', () => {
  const basis = dateiBasis({ nr: '01', titel: 'Klassik' }, 'hell', 'Niklas Trojovsky')

  it('baut die Basis aus Nummer, Titel, Farbwelt und Name', () => {
    expect(basis).toBe('Augusta-Energy_Visitenkarte_01-Klassik_Hell_Niklas-Trojovsky')
    expect(dateiBasis({ nr: '05', titel: 'Kontakt-QR' }, 'dunkel', '  ')).toBe('Augusta-Energy_Visitenkarte_05-Kontakt-QR_Dunkel_Karte')
    expect(dateiBasis({ nr: '04', titel: 'Porträt' }, 'hell', 'Jörg Müßig')).toBe('Augusta-Energy_Visitenkarte_04-Portraet_Hell_Joerg-Muessig')
  })

  it('hängt Seite, dpi, Beschnitt und Endung an', () => {
    expect(svgDateiname(basis, 'vorderseite', false)).toBe(`${basis}_Vorderseite.svg`)
    expect(svgDateiname(basis, 'rueckseite', true)).toBe(`${basis}_Rueckseite_Beschnitt.svg`)
    expect(pngDateiname(basis, 'vorderseite', 300, false)).toBe(`${basis}_Vorderseite_300dpi.png`)
    expect(pngDateiname(basis, 'rueckseite', 600, true)).toBe(`${basis}_Rueckseite_600dpi_Beschnitt.png`)
    expect(pdfDateiname(basis, false)).toBe(`${basis}_Druck.pdf`)
    expect(pdfDateiname(basis, true)).toBe(`${basis}_Druck-verlustfrei.pdf`)
  })
})
