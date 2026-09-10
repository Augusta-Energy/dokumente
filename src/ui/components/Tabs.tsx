import { useRef, type KeyboardEvent } from 'react'

export type TabOption<T extends string> = { wert: T; label: string; id?: string; panelId?: string }

export function Tabs<T extends string>({ wert, onChange, tabs }: { wert: T; onChange: (wert: T) => void; tabs: TabOption<T>[] }) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([])

  const geheZu = (index: number) => {
    const ziel = tabs[index]
    if (!ziel) return
    onChange(ziel.wert)
    buttonRefs.current[index]?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const aktivIndex = tabs.findIndex((t) => t.wert === wert)
    if (aktivIndex === -1) return
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        geheZu((aktivIndex - 1 + tabs.length) % tabs.length)
        break
      case 'ArrowRight':
        e.preventDefault()
        geheZu((aktivIndex + 1) % tabs.length)
        break
      case 'Home':
        e.preventDefault()
        geheZu(0)
        break
      case 'End':
        e.preventDefault()
        geheZu(tabs.length - 1)
        break
    }
  }

  return (
    <div role="tablist" aria-label="Dokumentart" className="flex gap-8 border-b border-line" onKeyDown={onKeyDown}>
      {tabs.map((tab, index) => {
        const aktiv = tab.wert === wert
        return (
          <button
            key={tab.wert}
            ref={(el) => { buttonRefs.current[index] = el }}
            id={tab.id}
            type="button"
            role="tab"
            aria-selected={aktiv}
            aria-controls={aktiv ? tab.panelId : undefined}
            tabIndex={aktiv ? 0 : -1}
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
