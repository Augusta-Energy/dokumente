import { useMemo, useState } from 'react'
import type { Absender } from '../lib/absender'
import { heuteIso } from '../lib/datum'
import { useLocalStorageState } from '../lib/storage'
import { beispielVergleich } from '../lib/vergleich/beispiel'
import { berechneVergleich } from '../lib/vergleich/berechnung'
import { fehlendePflichtfelder } from '../lib/vergleich/pflichtfelder'
import { leererVergleich, type VergleichDaten } from '../lib/vergleich/types'
import { neueVergleichsnummer } from '../lib/vergleich/vergleichsnummer'
import { VergleichDocument, vergleichDateiname } from '../pdf/VergleichDocument'
import { DocumentWorkspace } from './DocumentWorkspace'
import { useDebouncedValue } from './useDebouncedValue'
import { VergleichForm } from './VergleichForm'

export const VERGLEICH_KEY = 'augusta-dokumente:v1:vergleich'

export function VergleichWorkspace({ absender }: { absender: Absender }) {
  const [vorlage] = useState(() => leererVergleich(heuteIso(), neueVergleichsnummer(), absender.ansprechpartner))
  const [daten, setDaten] = useLocalStorageState<VergleichDaten>(VERGLEICH_KEY, vorlage)
  const entprellt = useDebouncedValue(daten, 400)
  const dokument = useMemo(() => <VergleichDocument daten={entprellt} absender={absender} />, [entprellt, absender])
  const ergebnis = useMemo(() => berechneVergleich(daten), [daten])
  const fehlend = useMemo(() => fehlendePflichtfelder(entprellt), [entprellt])

  return (
    <DocumentWorkspace
      dokument={dokument}
      dateiname={vergleichDateiname(entprellt)}
      fehlendeFelder={fehlend}
      aktuell={entprellt === daten}
      onBeispiel={() => setDaten(beispielVergleich(heuteIso()))}
      onZuruecksetzen={() => setDaten(leererVergleich(heuteIso(), neueVergleichsnummer(), absender.ansprechpartner))}
    >
      <VergleichForm daten={daten} setDaten={setDaten} ergebnis={ergebnis} />
    </DocumentWorkspace>
  )
}
