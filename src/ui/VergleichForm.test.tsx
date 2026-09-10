import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { beispielVergleich } from '../lib/vergleich/beispiel'
import { berechneVergleich } from '../lib/vergleich/berechnung'
import { VergleichForm } from './VergleichForm'

describe('VergleichForm', () => {
  it('zeigt Kundendaten, Tarif-Abschnitte, Ergebnis-Kennzahlen, Lieferende-Hinweis und gewählten Unterzeichner', () => {
    const daten = beispielVergleich('2026-09-10')
    const ergebnis = berechneVergleich(daten)
    const html = renderToStaticMarkup(<VergleichForm daten={daten} setDaten={() => {}} ergebnis={ergebnis} />)

    expect(html).toContain('id="v-firma"')
    expect(html).toContain('value="Muster Gastronomie GmbH"')

    expect(html).toContain('Unsere Empfehlung')
    expect(html).toContain('Aktueller Tarif')

    expect(html).toContain('16.436,36 €')
    expect(html).toContain('980,90 €')

    expect(html).toContain('Lieferende 31.12.2028')

    const selectStart = html.indexOf('<select id="v-unterzeichner-auswahl"')
    const selectEnde = html.indexOf('</select>', selectStart)
    const auswahlHtml = html.slice(selectStart, selectEnde)
    const optionen = auswahlHtml.split('</option>')
    const gabriel = optionen.find((teil) => teil.includes('value="Gabriel Stefa"')) ?? ''
    expect(gabriel).toContain('selected')
  })
})
