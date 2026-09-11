import montserrat500 from '@fontsource/montserrat/files/montserrat-latin-500-normal.woff2?inline'
import montserrat600 from '@fontsource/montserrat/files/montserrat-latin-600-normal.woff2?inline'
import montserrat700 from '@fontsource/montserrat/files/montserrat-latin-700-normal.woff2?inline'
import raleway400 from '@fontsource/raleway/files/raleway-latin-400-normal.woff2?inline'
import raleway500 from '@fontsource/raleway/files/raleway-latin-500-normal.woff2?inline'
import raleway600 from '@fontsource/raleway/files/raleway-latin-600-normal.woff2?inline'
import { schriftenCss } from './fonts.svg'

/** Schriften-CSS für Export-SVGs und Druckansicht (im Bundle eingebettet, ≈180 KB). */
export const SCHRIFTEN_CSS = schriftenCss({ montserrat500, montserrat600, montserrat700, raleway400, raleway500, raleway600 })
