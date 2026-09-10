import type { ReactNode } from 'react'

export function Field({ label, htmlFor, hinweis, breit = false, children }: { label: string; htmlFor: string; hinweis?: string; breit?: boolean; children: ReactNode }) {
  return (
    <div className={breit ? 'sm:col-span-2' : ''}>
      <label htmlFor={htmlFor} className="feld-label">{label}</label>
      {children}
      {hinweis ? <p className="mt-1 text-xs text-muted">{hinweis}</p> : null}
    </div>
  )
}
