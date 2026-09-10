export type TabOption<T extends string> = { wert: T; label: string }

export function Tabs<T extends string>({ wert, onChange, tabs }: { wert: T; onChange: (wert: T) => void; tabs: TabOption<T>[] }) {
  return (
    <div role="tablist" aria-label="Dokumentart" className="flex gap-8 border-b border-line">
      {tabs.map((tab) => {
        const aktiv = tab.wert === wert
        return (
          <button
            key={tab.wert}
            type="button"
            role="tab"
            aria-selected={aktiv}
            onClick={() => onChange(tab.wert)}
            className={`eyebrow -mb-px border-b-2 pb-3 pt-1 transition-colors ${aktiv ? 'border-gold text-ink' : 'border-transparent text-muted hover:text-ink'}`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
