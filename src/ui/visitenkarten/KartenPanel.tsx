import { useId, type ChangeEvent } from 'react'
import { PERSONEN, webUrl, whatsappUrl } from '../../lib/visitenkarten/personen'
import { INSTAGRAM_URL } from '../../lib/visitenkarten/texte'
import type { FarbweltWahl, Karte, VisitenkartenZustand } from '../../lib/visitenkarten/typen'
import { Button } from '../components/Button'
import { Field } from '../components/Field'
import { TextInput, Toggle } from '../components/Inputs'

type Props = {
  zustand: VisitenkartenZustand
  hatFoto: boolean
  fotoFehler: string | null
  onPerson: (id: string) => void
  onKarte: (karte: Karte) => void
  onOption: <K extends keyof VisitenkartenZustand>(schluessel: K, wert: VisitenkartenZustand[K]) => void
  onEigenesFoto: (datei: File) => void
}

const FELDER: Array<{ key: keyof Karte; label: string; type?: 'text' | 'email' | 'tel'; hinweis?: string }> = [
  { key: 'name', label: 'Name' },
  { key: 'rolle', label: 'Rolle / Titel' },
  { key: 'telefon', label: 'Telefon', type: 'tel' },
  { key: 'email', label: 'E-Mail', type: 'email' },
  { key: 'web', label: 'Website' },
  { key: 'adresse', label: 'Adresse', hinweis: 'Leer = ausblenden. Format „Straße · PLZ Ort“ für den vCard-QR.' },
]

const FARBWELTEN: Array<{ wert: FarbweltWahl; label: string }> = [
  { wert: 'hell', label: 'Hell' },
  { wert: 'dunkel', label: 'Dunkel' },
  { wert: 'beide', label: 'Beide' },
]

function Segment<T extends string>({ label, wert, optionen, onChange }: { label: string; wert: T | null; optionen: Array<{ wert: T; label: string }>; onChange: (wert: T) => void }) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap border border-ink">
      {optionen.map((o) => {
        const aktiv = o.wert === wert
        return (
          <button
            key={o.wert}
            type="button"
            aria-pressed={aktiv}
            onClick={() => onChange(o.wert)}
            className={`eyebrow px-4 py-2.5 text-[0.66rem] transition-colors ${aktiv ? 'bg-ink text-gold' : 'text-ink hover:bg-cream'}`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function KartenPanel({ zustand, hatFoto, fotoFehler, onPerson, onKarte, onOption, onEigenesFoto }: Props) {
  const id = useId()
  const k = zustand.karte
  const setFeld = (key: keyof Karte, wert: string) => onKarte({ ...k, [key]: wert })
  const onDatei = (e: ChangeEvent<HTMLInputElement>) => {
    const datei = e.target.files?.[0]
    if (datei) onEigenesFoto(datei)
    e.target.value = ''
  }

  return (
    <section className="border border-line bg-cream/40 p-5 md:p-6">
      <h2 className="eyebrow text-gold-deep">Kartendetails</h2>
      <p className="mt-2 max-w-prose text-sm text-ink-600">
        Person wählen oder Daten frei eintragen – alle Vorschauen und QR-Codes folgen sofort. Telefon, E-Mail und Adresse der Voreinstellungen kommen aus „Absender“.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-3">
        <Segment label="Person wählen" wert={zustand.personId} optionen={PERSONEN.map((p) => ({ wert: p.id, label: p.kurz }))} onChange={onPerson} />
        <Segment label="Farbwelt" wert={zustand.farbwelt} optionen={FARBWELTEN} onChange={(w) => onOption('farbwelt', w)} />
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FELDER.map((f) => (
          <Field key={f.key} label={f.label} htmlFor={`${id}-${f.key}`} hinweis={f.hinweis}>
            <TextInput id={`${id}-${f.key}`} type={f.type} value={k[f.key]} onChange={(w) => setFeld(f.key, w)} />
          </Field>
        ))}
        <Field label="QR-Link (Rückseite Design 05)" htmlFor={`${id}-qrLink`}>
          <TextInput id={`${id}-qrLink`} value={k.qrLink} onChange={(w) => setFeld('qrLink', w)} />
          <div className="mt-1 flex flex-wrap gap-1">
            <Button variante="text" klein onClick={() => setFeld('qrLink', webUrl(k.web))}>Website</Button>
            <Button variante="text" klein onClick={() => setFeld('qrLink', whatsappUrl(k.telefon))}>WhatsApp</Button>
            <Button variante="text" klein onClick={() => setFeld('qrLink', INSTAGRAM_URL)}>Instagram</Button>
          </div>
        </Field>
      </div>
      <div className="mt-5 flex flex-wrap items-start gap-x-8 gap-y-3">
        <Toggle id={`${id}-foto`} checked={zustand.fotoAnzeigen && hatFoto} onChange={(w) => onOption('fotoAnzeigen', w)} label="Foto anzeigen" hinweis={hatFoto ? undefined : 'Für diese Karte liegt kein Foto vor.'} disabled={!hatFoto} />
        <label className="btn btn-outline btn-sm cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-gold">
          <input type="file" accept="image/*" className="sr-only" onChange={onDatei} />
          Eigenes Foto …
        </label>
        <Toggle id={`${id}-hilfslinien`} checked={zustand.hilfslinien} onChange={(w) => onOption('hilfslinien', w)} label="Schnittkante & Sicherheitsbereich anzeigen" hinweis="Rot = Schnittkante, Blau = Sicherheitsbereich (5 mm)" />
        <Toggle id={`${id}-beschnitt`} checked={zustand.beschnittExport} onChange={(w) => onOption('beschnittExport', w)} label="SVG/PNG mit 3 mm Beschnitt exportieren" />
      </div>
      {fotoFehler ? <p role="alert" className="mt-3 text-sm text-red-800">{fotoFehler}</p> : null}
    </section>
  )
}
