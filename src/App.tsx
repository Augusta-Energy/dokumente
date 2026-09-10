import { useState } from 'react'
import { Logo } from './brand/Logo'
import { standardAbsender, type Absender } from './lib/absender'
import { useLocalStorageState } from './lib/storage'
import { AbsenderPanel } from './ui/AbsenderPanel'
import { Button } from './ui/components/Button'
import { Tabs } from './ui/components/Tabs'
import { VergleichWorkspace } from './ui/VergleichWorkspace'
import { VollmachtWorkspace } from './ui/VollmachtWorkspace'

type Tab = 'vergleich' | 'vollmacht'

const TABS: { wert: Tab; label: string; id: string; panelId: string }[] = [
  { wert: 'vergleich', label: 'Energie-Vergleich', id: 'tab-vergleich', panelId: 'panel-vergleich' },
  { wert: 'vollmacht', label: 'Vollmacht', id: 'tab-vollmacht', panelId: 'panel-vollmacht' },
]

export function App() {
  const [tab, setTab] = useLocalStorageState<Tab>('augusta-dokumente:v1:tab', 'vergleich')
  const [absender, setAbsender, absenderZuruecksetzen] = useLocalStorageState<Absender>('augusta-dokumente:v1:absender', standardAbsender)
  const [absenderOffen, setAbsenderOffen] = useState(false)
  const aktiverTab = TABS.find((t) => t.wert === tab)!

  return (
    <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
        <div className="flex items-center gap-4">
          <Logo className="h-9 w-auto md:h-10" />
          <span className="eyebrow border-l border-line pl-4 text-gold-deep">Dokumente</span>
        </div>
        <Button klein onClick={() => setAbsenderOffen(true)}>Absender</Button>
      </header>

      <main className="py-8">
        <p className="eyebrow text-muted">Dokument wählen</p>
        <div className="mt-3">
          <Tabs wert={tab} onChange={setTab} tabs={TABS} />
        </div>
        <div className="mt-8" role="tabpanel" id={aktiverTab.panelId} aria-labelledby={aktiverTab.id}>
          {tab === 'vergleich' ? <VergleichWorkspace absender={absender} /> : <VollmachtWorkspace absender={absender} />}
        </div>
      </main>

      <footer className="border-t border-line py-6 text-xs text-muted">
        Interne Anwendung von {absender.firma}. Eingaben bleiben im Browser – nichts wird an einen Server gesendet.
      </footer>

      <AbsenderPanel offen={absenderOffen} absender={absender} setAbsender={setAbsender} onReset={absenderZuruecksetzen} onClose={() => setAbsenderOffen(false)} />
    </div>
  )
}
