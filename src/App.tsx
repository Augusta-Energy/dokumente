import { lazy, Suspense, useCallback, useState } from 'react'
import { Logo } from './brand/Logo'
import { standardAbsender, type Absender } from './lib/absender'
import { useLocalStorageState } from './lib/storage'
import { AbsenderPanel } from './ui/AbsenderPanel'
import { Button } from './ui/components/Button'
import { Fehlergrenze } from './ui/components/Fehlergrenze'
import { Tabs } from './ui/components/Tabs'
import { VergleichWorkspace, VERGLEICH_KEY } from './ui/VergleichWorkspace'
import { VollmachtWorkspace, VOLLMACHT_KEY } from './ui/VollmachtWorkspace'

// Eigener Chunk: die Render-Engine (QR, Canvas-Textmessung, Export nach SVG/PNG/PDF) wiegt spürbar,
// wird aber nur gebraucht, wenn der Reiter „Visitenkarten“ tatsächlich geöffnet wird.
const VisitenkartenWorkspace = lazy(() =>
  import('./ui/visitenkarten/VisitenkartenWorkspace').then((m) => ({ default: m.VisitenkartenWorkspace })),
)

type Tab = 'vergleich' | 'vollmacht' | 'visitenkarten'

const TABS: { wert: Tab; label: string; id: string; panelId: string }[] = [
  { wert: 'vergleich', label: 'Energie-Vergleich', id: 'tab-vergleich', panelId: 'panel-vergleich' },
  { wert: 'vollmacht', label: 'Vollmacht', id: 'tab-vollmacht', panelId: 'panel-vollmacht' },
  { wert: 'visitenkarten', label: 'Visitenkarten', id: 'tab-visitenkarten', panelId: 'panel-visitenkarten' },
]

// Speicher-Keys je Reiter für die Fehlergrenze (setzt bei „Zurücksetzen“ nur die Eingaben des betroffenen
// Reiters zurück). vergleich/vollmacht kommen als Re-Export der Workspaces – visitenkarten bewusst als
// Literal (identisch zu VISITENKARTE_KEY dort): ein Import von dort würde das lazy-geladene Modul
// oben wieder statisch einbinden und den eigenen Chunk zunichtemachen.
const SPEICHER_KEYS: Record<Tab, string> = {
  vergleich: VERGLEICH_KEY,
  vollmacht: VOLLMACHT_KEY,
  visitenkarten: 'augusta-dokumente:v1:visitenkarte',
}

export function App() {
  const [tab, setTab] = useLocalStorageState<Tab>('augusta-dokumente:v1:tab', 'vergleich')
  const [absender, setAbsender, absenderZuruecksetzen] = useLocalStorageState<Absender>('augusta-dokumente:v1:absender', standardAbsender)
  const [absenderOffen, setAbsenderOffen] = useState(false)
  const aktiverTab = TABS.find((t) => t.wert === tab) ?? TABS[0]
  const onAbsenderSchliessen = useCallback(() => setAbsenderOffen(false), [])

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-4">
          <Logo className="h-9 w-auto md:h-10" />
          <h1 className="eyebrow border-l border-line pl-4 text-gold-deep">Dokumente</h1>
        </div>
        <Button klein onClick={() => setAbsenderOffen(true)}>Absender</Button>
      </header>

      <main className="py-8">
        <p className="eyebrow text-muted">Dokument wählen</p>
        <div className="mt-3">
          <Tabs wert={aktiverTab.wert} onChange={setTab} tabs={TABS} />
        </div>
        <div className="mt-8" role="tabpanel" id={aktiverTab.panelId} aria-labelledby={aktiverTab.id}>
          <Fehlergrenze key={aktiverTab.wert} speicherKey={SPEICHER_KEYS[aktiverTab.wert]}>
            {aktiverTab.wert === 'vergleich' ? <VergleichWorkspace absender={absender} /> : null}
            {aktiverTab.wert === 'vollmacht' ? <VollmachtWorkspace absender={absender} /> : null}
            {aktiverTab.wert === 'visitenkarten' ? (
              <Suspense fallback={<p className="text-sm text-muted">Visitenkarten werden geladen …</p>}>
                <VisitenkartenWorkspace absender={absender} />
              </Suspense>
            ) : null}
          </Fehlergrenze>
        </div>
      </main>

      <footer className="border-t border-line py-6 text-xs text-muted">
        Interne Anwendung von {absender.firma}. Eingaben bleiben im Browser – nichts wird an einen Server gesendet.
      </footer>

      <AbsenderPanel offen={absenderOffen} absender={absender} setAbsender={setAbsender} onReset={absenderZuruecksetzen} onClose={onAbsenderSchliessen} />
    </div>
  )
}
