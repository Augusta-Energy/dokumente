import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { Logo } from './Logo'
import { farben } from './colors'

describe('Logo', () => {
  it('rendert Marke und Wortmarke in Ink und Gold', () => {
    const html = renderToStaticMarkup(<Logo />)
    expect(html).toContain('AUGUSTA')
    expect(html).toContain('ENERGY')
    expect(html).toContain(`fill="${farben.gold}"`)
    expect(html).toContain(`fill="${farben.ink}"`)
  })
  it('gibt auf dunklem Grund Creme statt Ink aus', () => {
    const html = renderToStaticMarkup(<Logo light markOnly />)
    expect(html).toContain(`fill="${farben.cream}"`)
    expect(html).not.toContain('AUGUSTA')
  })
})
