import { useState } from 'react'
import type { Design } from '../../lib/visitenkarten/designs'
import type { Farbwelt, Seite } from '../../lib/visitenkarten/typen'
import { Button } from '../components/Button'
import { KartenVorschau } from './KartenVorschau'

export type ExportAktion = { art: 'svg' | 'png300' | 'png600'; seite: Seite } | { art: 'pdf' | 'pdfVerlustfrei' | 'drucken' }

type Props = {
  design: Design
  farbwelten: readonly Farbwelt[]
  svg: (farbwelt: Farbwelt, seite: Seite) => string
  onExport: (farbwelt: Farbwelt, aktion: ExportAktion) => Promise<void>
}

const SEITEN: Array<{ wert: Seite; label: string }> = [
  { wert: 'vorderseite', label: 'Vorderseite' },
  { wert: 'rueckseite', label: 'Rückseite' },
]

export function DesignSektion({ design, farbwelten, svg, onExport }: Props) {
  const [laufend, setLaufend] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  const starte = async (farbwelt: Farbwelt, aktion: ExportAktion) => {
    setLaufend(true)
    setFehler(null)
    try {
      await onExport(farbwelt, aktion)
    } catch (e) {
      setFehler(e instanceof Error ? e.message : String(e))
    } finally {
      setLaufend(false)
    }
  }

  return (
    <section className="border-t border-line pb-6 pt-8">
      <div className="flex flex-wrap items-baseline gap-4">
        <span className="eyebrow text-gold-deep">Design {design.nr}</span>
        <h2 className="display text-2xl">{design.titel}</h2>
      </div>
      <p className="mt-2 max-w-prose text-sm text-ink-600">{design.beschreibung}</p>
      {farbwelten.map((farbwelt) => (
        <div key={farbwelt} className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="eyebrow text-muted">{farbwelt === 'hell' ? 'Hell' : 'Dunkel'}</span>
            <div className="flex flex-wrap gap-2">
              <Button variante="gold" klein disabled={laufend} onClick={() => starte(farbwelt, { art: 'pdf' })}>Druck-PDF 600 dpi</Button>
              <Button variante="gold" klein disabled={laufend} onClick={() => starte(farbwelt, { art: 'pdfVerlustfrei' })}>Druck-PDF verlustfrei</Button>
              <Button variante="outline" klein disabled={laufend} onClick={() => starte(farbwelt, { art: 'drucken' })}>Drucken → Vektor-PDF</Button>
            </div>
          </div>
          <div className="mt-3 grid gap-6 md:grid-cols-2">
            {SEITEN.map((seite) => (
              <div key={seite.wert}>
                <KartenVorschau svg={svg(farbwelt, seite.wert)} beschriftung={seite.label} />
                <div className="mt-1 flex flex-wrap gap-1">
                  <Button variante="text" klein disabled={laufend} onClick={() => starte(farbwelt, { art: 'svg', seite: seite.wert })}>SVG</Button>
                  <Button variante="text" klein disabled={laufend} onClick={() => starte(farbwelt, { art: 'png300', seite: seite.wert })}>PNG 300 dpi</Button>
                  <Button variante="text" klein disabled={laufend} onClick={() => starte(farbwelt, { art: 'png600', seite: seite.wert })}>PNG 600 dpi</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {fehler ? (
        <p role="alert" className="mt-4 border border-red-700 bg-red-50 p-3 text-sm text-red-800">Export fehlgeschlagen: {fehler}</p>
      ) : null}
    </section>
  )
}
