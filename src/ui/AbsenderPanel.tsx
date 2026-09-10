import { useEffect, type Dispatch, type SetStateAction } from 'react'
import { teamAuswahl, type Absender } from '../lib/absender'
import { Button } from './components/Button'
import { Field } from './components/Field'
import { Select, TextInput } from './components/Inputs'

type Props = {
  offen: boolean
  absender: Absender
  setAbsender: Dispatch<SetStateAction<Absender>>
  onReset: () => void
  onClose: () => void
}

const EIGENE = '__eigene__'

/** Seitlicher Dialog mit den Firmen- und Ansprechpartnerdaten, die in beide Dokumente laufen. */
export function AbsenderPanel({ offen, absender, setAbsender, onReset, onClose }: Props) {
  useEffect(() => {
    if (!offen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [offen, onClose])

  if (!offen) return null

  const feld = (key: keyof Omit<Absender, 'ansprechpartner'>) => (wert: string) => setAbsender((a) => ({ ...a, [key]: wert }))
  const ap = (patch: Partial<Absender['ansprechpartner']>) => setAbsender((a) => ({ ...a, ansprechpartner: { ...a.ansprechpartner, ...patch } }))
  const treffer = teamAuswahl.find((t) => t.name === absender.ansprechpartner.name && t.rolle === absender.ansprechpartner.rolle)

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-ink/50" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-labelledby="absender-titel" className="h-full w-full max-w-lg overflow-y-auto bg-paper p-6 shadow-2xl md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow text-gold-deep">Einstellungen</p>
            <h2 id="absender-titel" className="display mt-2 text-2xl">Absender</h2>
            <p className="mt-2 text-sm text-ink-600">Diese Angaben erscheinen in Kopf- und Fußzeile beider Dokumente. Sie werden nur in deinem Browser gespeichert.</p>
          </div>
          <Button klein onClick={onClose}>Fertig</Button>
        </div>

        <div className="mt-6 grid gap-4">
          <Field label="Firma" htmlFor="ab-firma"><TextInput id="ab-firma" value={absender.firma} onChange={feld('firma')} /></Field>
          <Field label="Inhaber" htmlFor="ab-inhaber"><TextInput id="ab-inhaber" value={absender.inhaber} onChange={feld('inhaber')} /></Field>
          <Field label="Straße und Hausnummer" htmlFor="ab-strasse"><TextInput id="ab-strasse" value={absender.strasse} onChange={feld('strasse')} /></Field>
          <div className="grid grid-cols-[1fr_2fr] gap-3">
            <Field label="PLZ" htmlFor="ab-plz"><TextInput id="ab-plz" value={absender.plz} onChange={feld('plz')} /></Field>
            <Field label="Ort" htmlFor="ab-ort"><TextInput id="ab-ort" value={absender.ort} onChange={feld('ort')} /></Field>
          </div>
          <Field label="Telefon" htmlFor="ab-telefon" hinweis="Schreibweise: 0151 41378008"><TextInput id="ab-telefon" type="tel" value={absender.telefon} onChange={feld('telefon')} /></Field>
          <Field label="E-Mail" htmlFor="ab-email"><TextInput id="ab-email" type="email" value={absender.email} onChange={feld('email')} /></Field>
          <Field label="Website" htmlFor="ab-web"><TextInput id="ab-web" value={absender.web} onChange={feld('web')} /></Field>
          <Field label="USt-IdNr. (optional)" htmlFor="ab-ust"><TextInput id="ab-ust" value={absender.ustIdNr} onChange={feld('ustIdNr')} placeholder="DE123456789" /></Field>
          <Field label="Bank (optional)" htmlFor="ab-bank"><TextInput id="ab-bank" value={absender.bank} onChange={feld('bank')} /></Field>
          <Field label="IBAN (optional)" htmlFor="ab-iban"><TextInput id="ab-iban" value={absender.iban} onChange={feld('iban')} /></Field>

          <p className="eyebrow mt-4 text-gold-deep">Ansprechpartner</p>
          <Field label="Auswahl" htmlFor="ab-ap-auswahl">
            <Select
              id="ab-ap-auswahl"
              value={treffer ? treffer.name : EIGENE}
              onChange={(wert) => {
                const t = teamAuswahl.find((x) => x.name === wert)
                if (t) ap({ name: t.name, rolle: t.rolle })
              }}
              optionen={[...teamAuswahl.map((t) => ({ wert: t.name, label: `${t.name} – ${t.rolle}` })), { wert: EIGENE, label: 'Eigene Angabe' }]}
            />
          </Field>
          <Field label="Name" htmlFor="ab-ap-name"><TextInput id="ab-ap-name" value={absender.ansprechpartner.name} onChange={(name) => ap({ name })} /></Field>
          <Field label="Rolle" htmlFor="ab-ap-rolle"><TextInput id="ab-ap-rolle" value={absender.ansprechpartner.rolle} onChange={(rolle) => ap({ rolle })} /></Field>
          <Field label="Telefon" htmlFor="ab-ap-telefon"><TextInput id="ab-ap-telefon" type="tel" value={absender.ansprechpartner.telefon} onChange={(telefon) => ap({ telefon })} /></Field>
          <Field label="E-Mail" htmlFor="ab-ap-email"><TextInput id="ab-ap-email" type="email" value={absender.ansprechpartner.email} onChange={(email) => ap({ email })} /></Field>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
          <Button variante="text" klein onClick={() => { if (window.confirm('Absender auf die Standardwerte zurücksetzen?')) onReset() }}>Zurücksetzen auf Standard</Button>
          <Button variante="gold" klein onClick={onClose}>Fertig</Button>
        </div>
      </div>
    </div>
  )
}
