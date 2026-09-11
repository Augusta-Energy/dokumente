import { klassik } from './klassik'
import { kontakt } from './kontakt'
import { portraet } from './portraet'
import { rahmen } from './rahmen'
import { schraege } from './schraege'
import { signatur } from './signatur'
import type { Design } from './design'

export type { Design, DesignId } from './design'

export const DESIGNS: readonly Design[] = [klassik, signatur, rahmen, portraet, kontakt, schraege]
