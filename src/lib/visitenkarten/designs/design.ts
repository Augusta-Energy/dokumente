import type { Zeichner } from '../svg'

export type DesignId = 'klassik' | 'signatur' | 'rahmen' | 'portraet' | 'kontakt' | 'schraege'

export type Design = {
  id: DesignId
  nr: string
  titel: string
  beschreibung: string
  vorderseite: (z: Zeichner) => string
  rueckseite: (z: Zeichner) => string
}
