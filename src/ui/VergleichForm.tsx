import type { Dispatch, SetStateAction } from 'react'
import { teamAuswahl } from '../lib/absender'
import { datum, euro } from '../lib/format'
import type { VergleichErgebnis } from '../lib/vergleich/berechnung'
import { neueVergleichsnummer } from '../lib/vergleich/vergleichsnummer'
import type { Tarif, VergleichDaten } from '../lib/vergleich/types'
import { Button } from './components/Button'
import { Field } from './components/Field'
import { DateInput, DezimalInput, RadioGroup, Select, Textarea, TextInput, Toggle } from './components/Inputs'
import { Section } from './components/Section'

type Setter = Dispatch<SetStateAction<VergleichDaten>>
type Props = { daten: VergleichDaten; setDaten: Setter; ergebnis: VergleichErgebnis }

function teil<K extends keyof VergleichDaten>(setDaten: Setter, key: K) {
  return (patch: Partial<VergleichDaten[K]>) => setDaten((d) => ({ ...d, [key]: { ...d[key], ...patch } }))
}

const EIGENE = '__eigene__'

function TarifFelder({ prefix, tarif, onChange }: { prefix: string; tarif: Tarif; onChange: (patch: Partial<Tarif>) => void }) {
  return (
    <>
      <Field label="Versorger" htmlFor={`${prefix}-versorger`}>
        <TextInput id={`${prefix}-versorger`} value={tarif.versorger} onChange={(versorger) => onChange({ versorger })} placeholder="z. B. M4ENERGY" />
      </Field>
      <Field label="Preisgarantie" htmlFor={`${prefix}-garantie`} hinweis="Freitext, z. B. „Energiepreisgarantie bis 31.12.2028“">
        <TextInput id={`${prefix}-garantie`} value={tarif.preisgarantie} onChange={(preisgarantie) => onChange({ preisgarantie })} />
      </Field>
      <Field label="Arbeitspreis (netto)" htmlFor={`${prefix}-arbeitspreis`}>
        <DezimalInput id={`${prefix}-arbeitspreis`} value={tarif.arbeitspreisCt} onChange={(arbeitspreisCt) => onChange({ arbeitspreisCt })} einheit="ct/kWh" placeholder="30,54" />
      </Field>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Field label="Grundpreis (netto)" htmlFor={`${prefix}-grundpreis`}>
          <DezimalInput id={`${prefix}-grundpreis`} value={tarif.grundpreis} onChange={(grundpreis) => onChange({ grundpreis })} einheit="€" placeholder="123,11" />
        </Field>
        <Field label="je" htmlFor={`${prefix}-grundpreis-einheit`}>
          <Select id={`${prefix}-grundpreis-einheit`} value={tarif.grundpreisEinheit} onChange={(grundpreisEinheit) => onChange({ grundpreisEinheit })} optionen={[{ wert: 'jahr', label: 'Jahr' }, { wert: 'monat', label: 'Monat' }]} />
        </Field>
      </div>
    </>
  )
}

function Kennzahl({ label, wert }: { label: string; wert: string }) {
  return (
    <div className="border-l-2 border-gold pl-3">
      <p className="feld-label mb-0">{label}</p>
      <p className="font-display text-lg font-semibold">{wert}</p>
    </div>
  )
}

export function VergleichForm({ daten, setDaten, ergebnis }: Props) {
  const kunde = teil(setDaten, 'kunde')
  const vergleich = teil(setDaten, 'vergleich')
  const lieferstelle = teil(setDaten, 'lieferstelle')
  const empfehlung = teil(setDaten, 'empfehlung')
  const aktuell = teil(setDaten, 'aktuell')
  const honorar = teil(setDaten, 'honorar')
  const konzessionsabgabe = teil(setDaten, 'konzessionsabgabe')
  const unterzeichner = teil(setDaten, 'unterzeichner')

  const teamTreffer = teamAuswahl.find((t) => t.name === daten.unterzeichner.name && t.rolle === daten.unterzeichner.rolle)
  const unterzeichnerAuswahl = teamTreffer ? teamTreffer.name : EIGENE

  return (
    <div>
      <Section titel="Kunde">
        <Field label="Firma" htmlFor="v-firma" hinweis="Leer lassen bei Privatkunden">
          <TextInput id="v-firma" value={daten.kunde.firma} onChange={(firma) => kunde({ firma })} />
        </Field>
        <RadioGroup name="v-anrede" label="Anrede" value={daten.kunde.anrede} onChange={(anrede) => kunde({ anrede })} optionen={[{ wert: 'firma', label: 'Damen und Herren' }, { wert: 'frau', label: 'Frau' }, { wert: 'herr', label: 'Herr' }, { wert: 'divers', label: 'Guten Tag + Name' }]} />
        <Field label="Vorname" htmlFor="v-vorname"><TextInput id="v-vorname" value={daten.kunde.vorname} onChange={(vorname) => kunde({ vorname })} /></Field>
        <Field label="Nachname" htmlFor="v-nachname"><TextInput id="v-nachname" value={daten.kunde.nachname} onChange={(nachname) => kunde({ nachname })} /></Field>
        <Field label="Straße und Hausnummer" htmlFor="v-strasse" breit><TextInput id="v-strasse" value={daten.kunde.strasse} onChange={(strasse) => kunde({ strasse })} /></Field>
        <Field label="PLZ" htmlFor="v-plz"><TextInput id="v-plz" value={daten.kunde.plz} onChange={(plz) => kunde({ plz })} /></Field>
        <Field label="Ort" htmlFor="v-ort"><TextInput id="v-ort" value={daten.kunde.ort} onChange={(ort) => kunde({ ort })} /></Field>
      </Section>

      <Section titel="Vergleich">
        <Field label="Vergleichsnummer" htmlFor="v-nummer">
          <div className="flex gap-2">
            <TextInput id="v-nummer" value={daten.vergleich.nummer} onChange={(nummer) => vergleich({ nummer })} />
            <Button klein onClick={() => vergleich({ nummer: neueVergleichsnummer(daten.vergleich.datum || undefined) })}>Neu</Button>
          </div>
        </Field>
        <Field label="Datum" htmlFor="v-datum"><DateInput id="v-datum" value={daten.vergleich.datum} onChange={(datum) => vergleich({ datum })} /></Field>
        <Field label="Gültigkeit" htmlFor="v-gueltigkeit" hinweis={ergebnis.gueltigBis ? `Gültig bis ${datum(ergebnis.gueltigBis)}` : undefined}>
          <DezimalInput id="v-gueltigkeit" value={daten.vergleich.gueltigkeitTage} onChange={(gueltigkeitTage) => vergleich({ gueltigkeitTage })} einheit="Tage" />
        </Field>
        <Field label="Umsatzsteuer" htmlFor="v-ust"><DezimalInput id="v-ust" value={daten.vergleich.ustSatz} onChange={(ustSatz) => vergleich({ ustSatz })} einheit="%" /></Field>
        <RadioGroup name="v-preisdarstellung" label="Preisdarstellung" value={daten.vergleich.preisdarstellung} onChange={(preisdarstellung) => vergleich({ preisdarstellung })} optionen={[{ wert: 'netto', label: 'netto (Gewerbekunden)' }, { wert: 'brutto', label: 'brutto (Privatkunden)' }]} />
      </Section>

      <Section titel="Lieferstelle & Belieferung">
        <Field label="Straße und Hausnummer" htmlFor="v-ls-strasse" breit><TextInput id="v-ls-strasse" value={daten.lieferstelle.strasse} onChange={(strasse) => lieferstelle({ strasse })} /></Field>
        <Field label="PLZ" htmlFor="v-ls-plz"><TextInput id="v-ls-plz" value={daten.lieferstelle.plz} onChange={(plz) => lieferstelle({ plz })} /></Field>
        <Field label="Ort" htmlFor="v-ls-ort"><TextInput id="v-ls-ort" value={daten.lieferstelle.ort} onChange={(ort) => lieferstelle({ ort })} /></Field>
        <RadioGroup name="v-energieart" label="Energieart" value={daten.lieferstelle.energieart} onChange={(energieart) => lieferstelle({ energieart })} optionen={[{ wert: 'strom', label: 'Strom' }, { wert: 'gas', label: 'Gas' }]} />
        <Field label="Jahresverbrauch" htmlFor="v-verbrauch"><DezimalInput id="v-verbrauch" value={daten.lieferstelle.jahresverbrauchKwh} onChange={(jahresverbrauchKwh) => lieferstelle({ jahresverbrauchKwh })} einheit="kWh" placeholder="53416" /></Field>
        <Field label="Lieferbeginn" htmlFor="v-lieferbeginn"><DateInput id="v-lieferbeginn" value={daten.lieferstelle.lieferbeginn} onChange={(lieferbeginn) => lieferstelle({ lieferbeginn })} /></Field>
        <Field label="Laufzeit" htmlFor="v-laufzeit" hinweis={ergebnis.lieferende ? `Lieferende ${datum(ergebnis.lieferende)}` : 'Lieferende ergibt sich aus Beginn und Laufzeit'}>
          <DezimalInput id="v-laufzeit" value={daten.lieferstelle.laufzeitMonate} onChange={(laufzeitMonate) => lieferstelle({ laufzeitMonate })} einheit="Monate" />
        </Field>
      </Section>

      <Section titel="Unsere Empfehlung"><TarifFelder prefix="v-empf" tarif={daten.empfehlung} onChange={empfehlung} /></Section>
      <Section titel="Aktueller Tarif"><TarifFelder prefix="v-akt" tarif={daten.aktuell} onChange={aktuell} /></Section>

      <div className="grid gap-4 border-t border-line py-6 sm:grid-cols-4">
        <Kennzahl label="Jahreskosten Empfehlung" wert={euro(ergebnis.empfehlung.jahreskosten)} />
        <Kennzahl label="Jahreskosten aktuell" wert={euro(ergebnis.aktuell.jahreskosten)} />
        <Kennzahl label="Ersparnis pro Jahr" wert={euro(ergebnis.ersparnisJahr)} />
        <Kennzahl label="Gesamtersparnis Laufzeit" wert={euro(ergebnis.gesamtersparnisLaufzeit)} />
      </div>

      <Section titel="Beratungshonorar" beschreibung="Beträge netto, gesamt für die Laufzeit. Leere Felder erscheinen nicht im Dokument.">
        <div className="sm:col-span-2">
          <Toggle id="v-honorar-anzeigen" checked={daten.honorar.anzeigen} onChange={(anzeigen) => honorar({ anzeigen })} label="Honorar im Dokument ausweisen" hinweis="Ausgeschaltet: keine Honorartabelle, kein Honorar-Hinweis im Anschreiben." />
        </div>
        <Field label="Honorar Anbieterwechsel" htmlFor="v-honorar-wechsel"><DezimalInput id="v-honorar-wechsel" value={daten.honorar.anbieterwechsel} onChange={(anbieterwechsel) => honorar({ anbieterwechsel })} einheit="€" /></Field>
        <Field label="Honorar Konzessionsabgabe" htmlFor="v-honorar-ka"><DezimalInput id="v-honorar-ka" value={daten.honorar.konzessionsabgabe} onChange={(konzessionsabgabe) => honorar({ konzessionsabgabe })} einheit="€" /></Field>
      </Section>

      <Section titel="Konzessionsabgabe" beschreibung="Erwartete Ersparnis durch die Reduktion der Konzessionsabgabe, netto pro Jahr. Leer = nicht ausweisen.">
        <Field label="Reduktion pro Jahr" htmlFor="v-ka"><DezimalInput id="v-ka" value={daten.konzessionsabgabe.reduktionProJahr} onChange={(reduktionProJahr) => konzessionsabgabe({ reduktionProJahr })} einheit="€/Jahr" /></Field>
      </Section>

      <Section titel="Unterzeichner">
        <Field label="Auswahl" htmlFor="v-unterzeichner-auswahl" breit>
          <Select
            id="v-unterzeichner-auswahl"
            value={unterzeichnerAuswahl}
            onChange={(wert) => {
              const t = teamAuswahl.find((x) => x.name === wert)
              if (t) unterzeichner({ name: t.name, rolle: t.rolle })
              else unterzeichner({ name: '', rolle: '' })
            }}
            optionen={[...teamAuswahl.map((t) => ({ wert: t.name, label: `${t.name} – ${t.rolle}` })), { wert: EIGENE, label: 'Eigene Angabe' }]}
          />
        </Field>
        <Field label="Name" htmlFor="v-unterzeichner-name"><TextInput id="v-unterzeichner-name" value={daten.unterzeichner.name} onChange={(name) => unterzeichner({ name })} /></Field>
        <Field label="Rolle" htmlFor="v-unterzeichner-rolle"><TextInput id="v-unterzeichner-rolle" value={daten.unterzeichner.rolle} onChange={(rolle) => unterzeichner({ rolle })} /></Field>
      </Section>

      <Section titel="Hinweise" beschreibung="Optionaler Freitext für Seite 3.">
        <Field label="Hinweise" htmlFor="v-hinweise" breit><Textarea id="v-hinweise" value={daten.vergleich.hinweise} onChange={(hinweise) => vergleich({ hinweise })} /></Field>
      </Section>
    </div>
  )
}
