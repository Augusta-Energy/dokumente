import { useEffect, type ReactElement, type ReactNode } from 'react'
import { usePDF, type DocumentProps } from '@react-pdf/renderer'
import { Button } from './components/Button'

/** react-pdfs Typen sagen `error: string | null`, zur Laufzeit ist es aber oft ein Error-Objekt
 *  (`String(error)` würde dann „Error: …“ anzeigen) – daher hier auf `unknown` prüfen. */
function fehlermeldung(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

type Props = {
  /** Fertiges react-pdf-<Document>, bereits entprellt (useDebouncedValue) */
  dokument: ReactElement<DocumentProps>
  dateiname: string
  fehlendeFelder: string[]
  /** true, wenn die entprellten Daten (Basis von `dokument`/`dateiname`/`fehlendeFelder`) den aktuellen
   *  Formulardaten entsprechen – solange die Entprellung noch nachzieht, darf nicht heruntergeladen werden. */
  aktuell: boolean
  onBeispiel: () => void
  onZuruecksetzen: () => void
  children: ReactNode
}

/** Formular links, klebende Vorschau mit Werkzeugleiste rechts (ab lg), sonst untereinander. */
export function DocumentWorkspace({ dokument, dateiname, fehlendeFelder, aktuell, onBeispiel, onZuruecksetzen, children }: Props) {
  const [instanz, aktualisiere] = usePDF()
  useEffect(() => {
    aktualisiere(dokument)
  }, [dokument, aktualisiere])

  const bereit = Boolean(instanz.url) && !instanz.loading && !instanz.error && aktuell && fehlendeFelder.length === 0
  const fehlertext = fehlermeldung(instanz.error)

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <div>{children}</div>
      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="flex flex-wrap items-center gap-3">
          {bereit && instanz.url ? (
            <a className="btn btn-gold" href={instanz.url} download={dateiname}>PDF herunterladen</a>
          ) : (
            <Button variante="gold" disabled>PDF herunterladen</Button>
          )}
          <Button variante="outline" klein onClick={onBeispiel}>Beispieldaten laden</Button>
          <Button
            variante="text"
            klein
            onClick={() => {
              if (window.confirm('Alle Eingaben dieses Dokuments verwerfen?')) onZuruecksetzen()
            }}
          >
            Zurücksetzen
          </Button>
        </div>
        <div className="mt-3 min-h-6 text-sm" aria-live="polite">
          {instanz.loading || !aktuell ? <p className="text-muted">Vorschau wird aktualisiert …</p> : null}
          {instanz.error ? (
            <p role="alert" className="border border-red-700 bg-red-50 p-3 text-red-800">Die Vorschau konnte nicht erstellt werden: {fehlertext}</p>
          ) : null}
          {fehlendeFelder.length ? (
            <p className="text-ink-600"><span className="font-medium">Bitte ergänze:</span> {fehlendeFelder.join(', ')}</p>
          ) : null}
        </div>
        <div className="mt-3 aspect-[210/297] max-h-[80vh] w-full border border-line bg-cream">
          {instanz.url ? (
            <iframe key={instanz.url} title="PDF-Vorschau" src={`${instanz.url}#toolbar=0&navpanes=0&view=FitH`} className="h-full w-full" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted">Vorschau wird erstellt …</div>
          )}
        </div>
      </aside>
    </div>
  )
}
