import { mkdirSync, writeFileSync } from 'node:fs'
import { renderToBuffer } from '@react-pdf/renderer'
import { registerFonts } from '../src/brand/fonts.node.ts'
import { standardAbsender } from '../src/lib/absender'
import { heuteIso } from '../src/lib/datum'
import { beispielVergleich } from '../src/lib/vergleich/beispiel'
import { beispielVollmacht } from '../src/lib/vollmacht/beispiel'
import { VergleichDocument } from '../src/pdf/VergleichDocument'
import { VollmachtDocument } from '../src/pdf/VollmachtDocument'

registerFonts()
mkdirSync('out', { recursive: true })

const vergleich = await renderToBuffer(<VergleichDocument daten={beispielVergleich(heuteIso())} absender={standardAbsender} />)
writeFileSync('out/Energie-Vergleich.pdf', vergleich)
console.log('out/Energie-Vergleich.pdf geschrieben')

const vollmacht = await renderToBuffer(<VollmachtDocument daten={beispielVollmacht()} absender={standardAbsender} />)
writeFileSync('out/Vollmacht.pdf', vollmacht)
console.log('out/Vollmacht.pdf geschrieben')
