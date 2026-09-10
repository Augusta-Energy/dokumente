import { useMemo } from 'react'
import type { Absender } from '../lib/absender'
import { useLocalStorageState } from '../lib/storage'
import { beispielVollmacht } from '../lib/vollmacht/beispiel'
import { fehlendePflichtfelder } from '../lib/vollmacht/pflichtfelder'
import { leereVollmacht, type VollmachtDaten } from '../lib/vollmacht/types'
import { VollmachtDocument, vollmachtDateiname } from '../pdf/VollmachtDocument'
import { DocumentWorkspace } from './DocumentWorkspace'
import { useDebouncedValue } from './useDebouncedValue'
import { VollmachtForm } from './VollmachtForm'

export const VOLLMACHT_KEY = 'augusta-dokumente:v1:vollmacht'
const VORLAGE = leereVollmacht()

export function VollmachtWorkspace({ absender }: { absender: Absender }) {
  const [daten, setDaten] = useLocalStorageState<VollmachtDaten>(VOLLMACHT_KEY, VORLAGE)
  const entprellt = useDebouncedValue(daten, 400)
  const dokument = useMemo(() => <VollmachtDocument daten={entprellt} absender={absender} />, [entprellt, absender])
  const fehlend = useMemo(() => fehlendePflichtfelder(daten), [daten])

  return (
    <DocumentWorkspace
      dokument={dokument}
      dateiname={vollmachtDateiname(daten)}
      fehlendeFelder={fehlend}
      onBeispiel={() => setDaten(beispielVollmacht())}
      onZuruecksetzen={() => setDaten(leereVollmacht())}
    >
      <VollmachtForm daten={daten} setDaten={setDaten} />
    </DocumentWorkspace>
  )
}
