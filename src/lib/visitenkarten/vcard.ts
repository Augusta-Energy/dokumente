import type { Karte } from './typen'

/** „0151 …“ → „+49151…“, „0049 …“ → „+49…“; Leerzeichen und Trennzeichen fallen weg. */
export function normalisiereTelefon(t: string): string {
  let s = t.replace(/[^\d+]/g, '')
  if (s.startsWith('00')) s = '+' + s.slice(2)
  else if (s.startsWith('0')) s = '+49' + s.slice(1)
  return s
}

/** vCard-Wert: Backslash, Semikolon und Komma müssen escaped werden (RFC 2426). */
function wert(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/[;,]/g, (z) => '\\' + z)
}

/** vCard 3.0 (CRLF). Nachname = letztes Wort; ein einzelnes Wort gilt als Vorname.
 *  Entspricht der Name (getrimmt, ohne Groß-/Kleinschreibung) der Firma, ist die Karte eine Organisationskarte
 *  (z. B. die „Zentrale“-Karte, deren Name aus dem Firmennamen übernommen wird) – dann bleibt N leer und FN trägt die Firma. */
export function vcardText(k: Karte, firma: string): string {
  const name = k.name.trim()
  const istOrganisation = firma.trim() !== '' && name.toLowerCase() === firma.trim().toLowerCase()
  const zeilen = ['BEGIN:VCARD', 'VERSION:3.0']
  if (istOrganisation) {
    zeilen.push('N:;;;;', `FN:${wert(firma.trim())}`)
  } else {
    const teile = name.split(/\s+/).filter(Boolean)
    const nachname = teile.length > 1 ? teile[teile.length - 1] : ''
    const vorname = teile.length > 1 ? teile.slice(0, -1).join(' ') : (teile[0] ?? '')
    zeilen.push(`N:${wert(nachname)};${wert(vorname)};;;`, `FN:${wert(name)}`)
  }
  if (firma) zeilen.push(`ORG:${wert(firma.trim())}`)
  if (k.rolle) zeilen.push(`TITLE:${wert(k.rolle)}`)
  if (k.telefon) zeilen.push(`TEL;TYPE=CELL:${normalisiereTelefon(k.telefon)}`)
  if (k.email) zeilen.push(`EMAIL:${k.email}`)
  if (k.web) zeilen.push(`URL:${/^https?:/i.test(k.web) ? k.web : 'https://' + k.web}`)
  if (k.adresse) {
    const seg = k.adresse.split('·').map((s) => s.trim())
    const m = seg[1] ? seg[1].match(/^(\d{4,5})\s+(.+)$/) : null
    zeilen.push(
      m ? `ADR;TYPE=WORK:;;${wert(seg[0])};${wert(m[2])};;${m[1]};Deutschland` : `ADR;TYPE=WORK:;;${wert(k.adresse)};;;;`,
    )
  }
  zeilen.push('END:VCARD')
  return zeilen.join('\r\n')
}
