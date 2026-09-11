import type { Dispatch, SetStateAction } from 'react'
import { lieferstellenEnergieartLabel, neueLieferstelle, type Lieferstelle, type VollmachtDaten } from '../lib/vollmacht/types'
import { Button } from './components/Button'
import { Field } from './components/Field'
import { DateInput, RadioGroup, Select, TextInput, Toggle } from './components/Inputs'
import { Section } from './components/Section'

type Setter = Dispatch<SetStateAction<VollmachtDaten>>
type Props = { daten: VollmachtDaten; setDaten: Setter }

/** Schlüssel von `VollmachtDaten`, deren Wert ein Objekt (kein Array) ist – nur für diese ergibt
 *  `teil` (Teil-Update per Merge) Sinn; Arrays (`lieferstellen`) und Primitive (`untervollmacht`)
 *  scheiden aus. Ersetzt die vorherigen `as object`-Casts durch eine Typ-Einschränkung. */
type TeilKey = { [P in keyof VollmachtDaten]: VollmachtDaten[P] extends object ? (VollmachtDaten[P] extends unknown[] ? never : P) : never }[keyof VollmachtDaten]

function teil<K extends TeilKey>(setDaten: Setter, key: K) {
  return (patch: Partial<VollmachtDaten[K]>) =>
    setDaten((d) => ({ ...d, [key]: { ...d[key], ...patch } }))
}

const ENERGIEART_OPTIONEN = (Object.keys(lieferstellenEnergieartLabel) as Lieferstelle['energieart'][]).map((wert) => ({ wert, label: lieferstellenEnergieartLabel[wert] }))

export function VollmachtForm({ daten, setDaten }: Props) {
  const vg = teil(setDaten, 'vollmachtgeber')
  const energiearten = teil(setDaten, 'energiearten')
  const geltung = teil(setDaten, 'geltung')
  const unterschrift = teil(setDaten, 'unterschrift')
  const privat = daten.vollmachtgeber.typ === 'privat'

  const lieferstelleAendern = (id: string, patch: Partial<Lieferstelle>) =>
    setDaten((d) => ({ ...d, lieferstellen: d.lieferstellen.map((l) => (l.id === id ? { ...l, ...patch } : l)) }))
  const lieferstelleEntfernen = (id: string) => setDaten((d) => ({ ...d, lieferstellen: d.lieferstellen.filter((l) => l.id !== id) }))
  const lieferstelleHinzufuegen = () => setDaten((d) => ({ ...d, lieferstellen: [...d.lieferstellen, neueLieferstelle()] }))

  return (
    <div>
      <Section titel="Vollmachtgeber">
        <div className="sm:col-span-2">
          <RadioGroup name="vm-typ" label="Vollmachtgeber ist" value={daten.vollmachtgeber.typ} onChange={(typ) => vg({ typ })} optionen={[{ wert: 'privat', label: 'Privatperson' }, { wert: 'unternehmen', label: 'Unternehmen' }]} />
        </div>
        <Field label={privat ? 'Vor- und Nachname' : 'Firma'} htmlFor="vm-name" breit={!privat}>
          <TextInput id="vm-name" value={daten.vollmachtgeber.name} onChange={(name) => vg({ name })} />
        </Field>
        {privat ? (
          <Field label="Geburtsdatum (optional)" htmlFor="vm-geburtsdatum"><DateInput id="vm-geburtsdatum" value={daten.vollmachtgeber.geburtsdatum} onChange={(geburtsdatum) => vg({ geburtsdatum })} /></Field>
        ) : (
          <Field label="Vertreten durch (optional)" htmlFor="vm-vertreten" breit hinweis="z. B. „Geschäftsführer Max Mustermann“"><TextInput id="vm-vertreten" value={daten.vollmachtgeber.vertretenDurch} onChange={(vertretenDurch) => vg({ vertretenDurch })} /></Field>
        )}
        <Field label="Straße und Hausnummer" htmlFor="vm-strasse" breit><TextInput id="vm-strasse" value={daten.vollmachtgeber.strasse} onChange={(strasse) => vg({ strasse })} /></Field>
        <Field label="PLZ" htmlFor="vm-plz"><TextInput id="vm-plz" value={daten.vollmachtgeber.plz} onChange={(plz) => vg({ plz })} /></Field>
        <Field label="Ort" htmlFor="vm-ort"><TextInput id="vm-ort" value={daten.vollmachtgeber.ort} onChange={(ort) => vg({ ort })} /></Field>
        <Field label="E-Mail (optional)" htmlFor="vm-email"><TextInput id="vm-email" type="email" value={daten.vollmachtgeber.email} onChange={(email) => vg({ email })} /></Field>
        <Field label="Telefon (optional)" htmlFor="vm-telefon"><TextInput id="vm-telefon" type="tel" value={daten.vollmachtgeber.telefon} onChange={(telefon) => vg({ telefon })} /></Field>
      </Section>

      <Section titel="Energiearten" beschreibung="Die Vollmacht gilt nur für die gewählten Energiearten.">
        <Toggle id="vm-strom" checked={daten.energiearten.strom} onChange={(strom) => energiearten({ strom })} label="Strom" />
        <Toggle id="vm-gas" checked={daten.energiearten.gas} onChange={(gas) => energiearten({ gas })} label="Gas" />
      </Section>

      <Section titel="Lieferstellen" beschreibung="Alle Abnahmestellen, für die Augusta Energy handeln darf." aktionen={<Button klein onClick={lieferstelleHinzufuegen}>Lieferstelle hinzufügen</Button>}>
        {daten.lieferstellen.map((l, i) => (
          <div key={l.id} className="grid gap-3 border border-line bg-cream/40 p-4 sm:col-span-2 sm:grid-cols-2">
            <div className="flex items-center justify-between sm:col-span-2">
              <span className="eyebrow text-ink-600">Lieferstelle {i + 1}</span>
              {daten.lieferstellen.length > 1 ? (
                <Button variante="text" klein onClick={() => lieferstelleEntfernen(l.id)} aria-label={`Lieferstelle ${i + 1} entfernen`}>
                  Entfernen
                </Button>
              ) : null}
            </div>
            <Field label="Adresse" htmlFor={`vm-ls-${l.id}-adresse`} breit><TextInput id={`vm-ls-${l.id}-adresse`} value={l.adresse} onChange={(adresse) => lieferstelleAendern(l.id, { adresse })} placeholder="Musterstraße 12, 86150 Augsburg" /></Field>
            <Field label="Energieart" htmlFor={`vm-ls-${l.id}-energieart`}><Select id={`vm-ls-${l.id}-energieart`} value={l.energieart} onChange={(energieart) => lieferstelleAendern(l.id, { energieart })} optionen={ENERGIEART_OPTIONEN} /></Field>
            <Field label="Zählernummer" htmlFor={`vm-ls-${l.id}-zaehler`}><TextInput id={`vm-ls-${l.id}-zaehler`} value={l.zaehlernummer} onChange={(zaehlernummer) => lieferstelleAendern(l.id, { zaehlernummer })} /></Field>
            <Field label="Marktlokations-ID (optional)" htmlFor={`vm-ls-${l.id}-malo`}><TextInput id={`vm-ls-${l.id}-malo`} value={l.maloId} onChange={(maloId) => lieferstelleAendern(l.id, { maloId })} /></Field>
            <Field label="Bisheriger Versorger" htmlFor={`vm-ls-${l.id}-versorger`}><TextInput id={`vm-ls-${l.id}-versorger`} value={l.versorger} onChange={(versorger) => lieferstelleAendern(l.id, { versorger })} /></Field>
          </div>
        ))}
      </Section>

      <Section titel="Geltungsdauer">
        <div className="sm:col-span-2">
          <RadioGroup name="vm-geltung" label="Die Vollmacht gilt" value={daten.geltung.art} onChange={(art) => geltung({ art })} optionen={[{ wert: 'unbefristet', label: 'unbefristet bis auf Widerruf' }, { wert: 'befristet', label: 'befristet bis' }]} />
        </div>
        {daten.geltung.art === 'befristet' ? (
          <Field label="Befristet bis" htmlFor="vm-bis"><DateInput id="vm-bis" value={daten.geltung.bis} onChange={(bis) => geltung({ bis })} /></Field>
        ) : null}
      </Section>

      <Section titel="Untervollmacht">
        <div className="sm:col-span-2">
          <Toggle id="vm-untervollmacht" checked={daten.untervollmacht} onChange={(untervollmacht) => setDaten((d) => ({ ...d, untervollmacht }))} label="Untervollmacht an Dritte erlauben" hinweis="Standard: nur eigene Mitarbeitende dürfen handeln, keine Weitergabe an Dritte." />
        </div>
      </Section>

      <Section titel="Unterschrift" beschreibung="Datum leer lassen, wenn der Kunde es handschriftlich einträgt.">
        <Field label="Ort" htmlFor="vm-u-ort"><TextInput id="vm-u-ort" value={daten.unterschrift.ort} onChange={(ort) => unterschrift({ ort })} placeholder={daten.vollmachtgeber.ort || 'Augsburg'} /></Field>
        <Field label="Datum (optional)" htmlFor="vm-u-datum"><DateInput id="vm-u-datum" value={daten.unterschrift.datum} onChange={(datum) => unterschrift({ datum })} /></Field>
      </Section>
    </div>
  )
}
