import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { standardAbsender } from '../lib/absender'
import { AbsenderPanel } from './AbsenderPanel'

describe('AbsenderPanel', () => {
  it('rendert nichts, wenn das Panel geschlossen ist', () => {
    const html = renderToStaticMarkup(
      <AbsenderPanel offen={false} absender={standardAbsender} setAbsender={() => {}} onReset={() => {}} onClose={() => {}} />,
    )
    expect(html).toBe('')
  })

  it('zeigt den Dialog mit den Standard-Absenderdaten, wenn er offen ist', () => {
    const html = renderToStaticMarkup(
      <AbsenderPanel offen={true} absender={standardAbsender} setAbsender={() => {}} onReset={() => {}} onClose={() => {}} />,
    )
    expect(html).toContain('role="dialog"')
    expect(html).toContain('tabindex="-1"')

    const firmaInput = html.match(/<input[^>]*id="ab-firma"[^>]*>/)?.[0] ?? ''
    expect(firmaInput).toContain('value="Augusta Energy"')

    expect(html).toContain('Zurücksetzen auf Standard')

    const legend = html.match(/<legend[^>]*>[^<]*<\/legend>/)?.[0] ?? ''
    expect(legend).toContain('Ansprechpartner')

    // React escapt "&" als "&amp;" in der statischen Auszeichnung (renderToStaticMarkup).
    const optionen = html.split('</option>')
    const niklas = optionen.find((teil) => teil.includes('Niklas Trojovsky – Inhaber &amp; Vertriebsleitung')) ?? ''
    expect(niklas).toContain('selected')
  })
})
