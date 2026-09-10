import { Logo } from './brand/Logo'

export function App() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
      <header className="flex items-center justify-between border-b border-line pb-6">
        <Logo className="h-10 w-auto" />
        <span className="eyebrow text-gold-deep">Dokumente</span>
      </header>
      <main className="py-12">
        <p className="eyebrow text-gold-deep">Augusta Energy</p>
        <div className="gold-rule mt-4 w-16" />
        <h1 className="display mt-6 text-3xl md:text-5xl">Dokumente</h1>
        <p className="mt-6 max-w-xl text-ink-600">Energie-Vergleich und Vollmacht – die Generatoren folgen in den nächsten Schritten.</p>
      </main>
    </div>
  )
}
