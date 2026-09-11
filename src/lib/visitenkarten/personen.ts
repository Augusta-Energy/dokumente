import type { Absender } from '../absender'
import type { Karte, Person } from './typen'
import { normalisiereTelefon } from './vcard'

/** Team-Voreinstellungen. Telefon/E-Mail/Adresse kommen aus dem Absender (Panel „Absender“).
 *  Fotos liegen unter public/visitenkarten/team/ (Kopien der Website-Fotos). */
export const PERSONEN: readonly Person[] = [
  { id: 'niklas', kurz: 'Niklas', name: 'Niklas Trojovsky', rolle: 'Inhaber & Vertriebsleitung', foto: { datei: 'niklas-trojovsky.jpg', w: 898, h: 1200, crop: { x: 205, y: 120, s: 520 } } },
  { id: 'gabriel', kurz: 'Gabriel', name: 'Gabriel Stefa', rolle: 'Strom & Gas Experte', foto: { datei: 'gabriel-stefa.jpg', w: 900, h: 1200, crop: { x: 195, y: 110, s: 520 } } },
  { id: 'patrick', kurz: 'Patrick', name: 'Patrick Seebach', rolle: 'Beratung & Projektleitung', foto: { datei: 'patrick-seebach.jpg', w: 900, h: 1200, crop: { x: 210, y: 110, s: 520 } } },
  { id: 'zentrale', kurz: 'Zentrale', name: '', rolle: 'Photovoltaik · Wärmepumpen · Strom & Gas' },
]

export function findePerson(id: string | null | undefined): Person | undefined {
  return id ? PERSONEN.find((p) => p.id === id) : undefined
}

/** „augusta-energy.de“ → „https://augusta-energy.de“; leer bleibt leer. */
export function webUrl(web: string): string {
  const w = web.trim()
  if (!w) return ''
  return /^https?:\/\//i.test(w) ? w : `https://${w}`
}

/** wa.me erwartet die internationale Nummer ohne „+“. */
export function whatsappUrl(telefon: string): string {
  const n = normalisiereTelefon(telefon).replace(/\D/g, '')
  return n ? `https://wa.me/${n}` : ''
}

export function personKarte(p: Person, a: Absender): Karte {
  const ortszeile = [a.plz, a.ort].filter(Boolean).join(' ')
  return {
    name: p.name || a.firma,
    rolle: p.rolle,
    telefon: a.telefon,
    email: a.email,
    web: a.web,
    adresse: [a.strasse, ortszeile].filter(Boolean).join(' · '),
    qrLink: webUrl(a.web),
  }
}
