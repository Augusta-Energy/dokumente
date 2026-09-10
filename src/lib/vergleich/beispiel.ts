import type { VergleichDaten } from './types'

export function beispielVergleich(heute: string): VergleichDaten {
  return {
    kunde: { firma: 'Muster Gastronomie GmbH', anrede: 'herr', vorname: 'Max', nachname: 'Mustermann', strasse: 'Musterstraße 12', plz: '86150', ort: 'Augsburg' },
    vergleich: { nummer: `AE-${heute.replace(/-/g, '')}-MSTR`, datum: heute, gueltigkeitTage: '3', preisdarstellung: 'netto', ustSatz: '19', hinweise: '' },
    lieferstelle: { strasse: 'Musterstraße 12', plz: '86150', ort: 'Augsburg', energieart: 'strom', jahresverbrauchKwh: '53416', lieferbeginn: '2027-01-01', laufzeitMonate: '24' },
    empfehlung: { versorger: 'M4ENERGY', preisgarantie: 'Energiepreisgarantie bis 31.12.2028', arbeitspreisCt: '30,54', grundpreis: '123,11', grundpreisEinheit: 'jahr' },
    aktuell: { versorger: 'EnBW', preisgarantie: 'Preisgarantie abgelaufen', arbeitspreisCt: '32,44', grundpreis: '89,11', grundpreisEinheit: 'jahr' },
    honorar: { anzeigen: true, anbieterwechsel: '49,00', konzessionsabgabe: '320,50' },
    konzessionsabgabe: { reduktionProJahr: '794,83' },
    unterzeichner: { name: 'Gabriel Stefa', rolle: 'Strom & Gas Experte' },
  }
}
