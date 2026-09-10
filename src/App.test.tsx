import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactNode } from 'react'
import { App } from './App'

// `DocumentWorkspace` (gerendert von `VergleichWorkspace`/`VollmachtWorkspace`, die `App` immer
// eines von beiden rendert) ruft `usePDF()` aus '@react-pdf/renderer' direkt im Funktionskörper
// auf. Im Node-Build des Pakets ist das absichtlich nur ein Stub, der wirft (der Web-Build wird
// nur von Bundlern über das "browser"-Feld in package.json aufgelöst, nicht von Node/Vitest mit
// test.environment: 'node'). Der Mock ersetzt DocumentWorkspace durch einen reinen
// Children-Wrapper, sodass App server-seitig gerendert werden kann, ohne usePDF zu erreichen.
vi.mock('./ui/DocumentWorkspace', () => ({
  DocumentWorkspace: ({ children }: { children: ReactNode }) => <div data-workspace="">{children}</div>,
}))

describe('App', () => {
  it('zeigt Tabs, beide Dokumentnamen, den Absender-Button und ein Tabpanel', () => {
    const html = renderToStaticMarkup(<App />)
    expect(html).toContain('role="tablist"')
    expect(html).toContain('Energie-Vergleich')
    expect(html).toContain('Vollmacht')
    expect(html).toContain('>Absender<')
    expect(html).toContain('role="tabpanel"')
    expect(html).toContain('<h1')

    // Standard-Tab ist "vergleich" (kein localStorage server-seitig vorhanden, siehe
    // useLocalStorageState) – aria-controls erscheint laut Tabs-Komponente nur am aktiven Tab.
    const vergleichControls = html.match(/aria-controls="panel-vergleich"/g) ?? []
    expect(vergleichControls).toHaveLength(1)
    expect(html).not.toContain('aria-controls="panel-vollmacht"')
  })
})
