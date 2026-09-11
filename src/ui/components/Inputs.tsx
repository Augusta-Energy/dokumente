type Basis = { id: string; value: string; onChange: (wert: string) => void; placeholder?: string }

export function TextInput({ id, value, onChange, placeholder, type = 'text', maxLength }: Basis & { type?: 'text' | 'email' | 'tel'; maxLength?: number }) {
  return <input id={id} type={type} className="feld" value={value} placeholder={placeholder} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />
}

/** Zahlenfeld mit Einheit rechts; akzeptiert Komma und Punkt (parseDezimal). */
export function DezimalInput({ id, value, onChange, placeholder, einheit }: Basis & { einheit: string }) {
  return (
    <div className="relative">
      <input id={id} type="text" inputMode="decimal" className="feld pr-20 text-right" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted">{einheit}</span>
    </div>
  )
}

export function DateInput({ id, value, onChange }: Omit<Basis, 'placeholder'>) {
  return <input id={id} type="date" className="feld" value={value} onChange={(e) => onChange(e.target.value)} />
}

export function Textarea({ id, value, onChange, placeholder, zeilen = 4 }: Basis & { zeilen?: number }) {
  return <textarea id={id} rows={zeilen} className="feld" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
}

export type Option<T extends string> = { wert: T; label: string }

export function Select<T extends string>({ id, value, onChange, optionen }: { id: string; value: T; onChange: (wert: T) => void; optionen: Option<T>[] }) {
  return (
    <select id={id} className="feld" value={value} onChange={(e) => onChange(e.target.value as T)}>
      {optionen.map((o) => (
        <option key={o.wert} value={o.wert}>{o.label}</option>
      ))}
    </select>
  )
}

export function RadioGroup<T extends string>({ name, label, value, onChange, optionen }: { name: string; label: string; value: T; onChange: (wert: T) => void; optionen: Option<T>[] }) {
  return (
    <fieldset>
      <legend className="feld-label">{label}</legend>
      <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
        {optionen.map((o) => (
          <label key={o.wert} className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="radio" name={name} value={o.wert} checked={value === o.wert} onChange={() => onChange(o.wert)} className="accent-gold-deep" />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function Toggle({ id, checked, onChange, label, hinweis, disabled }: { id: string; checked: boolean; onChange: (checked: boolean) => void; label: string; hinweis?: string; disabled?: boolean }) {
  return (
    <label htmlFor={id} className={`flex cursor-pointer items-start gap-3 text-sm ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} className="mt-0.5 h-4 w-4 accent-gold-deep" />
      <span>
        <span className="font-medium">{label}</span>
        {hinweis ? <span className="block text-xs text-muted">{hinweis}</span> : null}
      </span>
    </label>
  )
}
