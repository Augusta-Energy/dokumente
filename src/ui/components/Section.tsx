import type { ReactNode } from 'react'

export function Section({ titel, beschreibung, aktionen, children }: { titel: string; beschreibung?: string; aktionen?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-t border-line pb-8 pt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="eyebrow text-gold-deep">{titel}</h2>
          <div className="gold-rule mt-3 w-10" />
          {beschreibung ? <p className="mt-3 max-w-prose text-sm text-ink-600">{beschreibung}</p> : null}
        </div>
        {aktionen}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}
