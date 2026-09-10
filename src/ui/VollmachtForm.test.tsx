import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { beispielVollmacht } from '../lib/vollmacht/beispiel'
import { leereVollmacht } from '../lib/vollmacht/types'
import { VollmachtForm } from './VollmachtForm'

describe('VollmachtForm', () => {
  it('zeigt bei Unternehmen alle Lieferstellen und die Vertretung statt des Geburtsdatums', () => {
    const html = renderToStaticMarkup(<VollmachtForm daten={beispielVollmacht()} setDaten={() => {}} />)
    expect(html).toContain('Lieferstelle 1')
    expect(html).toContain('Lieferstelle 2')
    expect(html).toContain('id="vm-name"')
    expect(html).toContain('value="Muster Gastronomie GmbH"')
    expect(html).toContain('Vertreten durch (optional)')
    expect(html).not.toContain('id="vm-geburtsdatum"')
  })

  it('zeigt bei Privatpersonen das Geburtsdatum statt der Vertretung', () => {
    const html = renderToStaticMarkup(<VollmachtForm daten={leereVollmacht()} setDaten={() => {}} />)
    expect(html).toContain('id="vm-geburtsdatum"')
    expect(html).not.toContain('Vertreten durch')
  })
})
