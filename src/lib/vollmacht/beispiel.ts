import type { VollmachtDaten } from './types'

export function beispielVollmacht(): VollmachtDaten {
  return {
    vollmachtgeber: {
      typ: 'unternehmen',
      name: 'Muster Gastronomie GmbH',
      vertretenDurch: 'Geschäftsführer Max Mustermann',
      strasse: 'Musterstraße 12',
      plz: '86150',
      ort: 'Augsburg',
      geburtsdatum: '',
      email: 'info@muster-gastronomie.de',
      telefon: '0821 1234567',
    },
    energiearten: { strom: true, gas: true },
    lieferstellen: [
      { id: 'beispiel-1', adresse: 'Musterstraße 12, 86150 Augsburg', energieart: 'strom', zaehlernummer: '1ABC0012345678', maloId: '51234567890', versorger: 'EnBW' },
      { id: 'beispiel-2', adresse: 'Beispielweg 4 (Lager), 86159 Augsburg', energieart: 'gas', zaehlernummer: '7GAS0098765', maloId: '', versorger: 'erdgas schwaben' },
    ],
    geltung: { art: 'unbefristet', bis: '' },
    untervollmacht: false,
    unterschrift: { ort: 'Augsburg', datum: '' },
  }
}
