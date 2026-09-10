import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Field } from './Field'
import { DezimalInput, RadioGroup, TextInput } from './Inputs'
import { Tabs } from './Tabs'

describe('UI-Bausteine', () => {
  it('verknüpft Label und Eingabefeld über die id', () => {
    const html = renderToStaticMarkup(
      <Field label="Firma" htmlFor="v-firma"><TextInput id="v-firma" value="Muster GmbH" onChange={() => {}} /></Field>,
    )
    expect(html).toContain('for="v-firma"')
    expect(html).toContain('id="v-firma"')
    expect(html).toContain('value="Muster GmbH"')
  })
  it('zeigt die Einheit am Dezimalfeld und nutzt die Dezimaltastatur', () => {
    const html = renderToStaticMarkup(<DezimalInput id="v-ap" value="30,54" onChange={() => {}} einheit="ct/kWh" />)
    // react-dom/server serialisiert das JSX-Prop `inputMode` unverändert (es steht nicht in
    // Reacts DOM-Property-Whitelist); im Browser liest/setzt das HTML-Attribut trotzdem
    // korrekt als `inputmode`, da HTML-Attributnamen case-insensitiv sind.
    expect(html).toContain('inputMode="decimal"')
    expect(html).toContain('ct/kWh')
  })
  it('markiert die gewählte Option und den aktiven Tab', () => {
    const radio = renderToStaticMarkup(<RadioGroup name="art" label="Energieart" value="gas" onChange={() => {}} optionen={[{ wert: 'strom', label: 'Strom' }, { wert: 'gas', label: 'Gas' }]} />)
    // Reacts SSR-Renderer ordnet die Attribute von <input> um (checked steht vor value),
    // daher hier je Option prüfen statt auf eine feste Attributreihenfolge zu matchen.
    const optionen = radio.split('</label>')
    const gas = optionen.find((teil) => teil.includes('value="gas"')) ?? ''
    const strom = optionen.find((teil) => teil.includes('value="strom"')) ?? ''
    expect(gas).toContain('checked')
    expect(strom).not.toContain('checked')
    const tabs = renderToStaticMarkup(<Tabs wert="vollmacht" onChange={() => {}} tabs={[{ wert: 'vergleich', label: 'Energie-Vergleich' }, { wert: 'vollmacht', label: 'Vollmacht' }]} />)
    expect(tabs).toContain('aria-selected="true"')
    expect(tabs).toContain('Vollmacht')
  })
})
