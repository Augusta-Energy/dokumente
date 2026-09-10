import montserrat500 from '@fontsource/montserrat/files/montserrat-latin-500-normal.woff?url'
import montserrat600 from '@fontsource/montserrat/files/montserrat-latin-600-normal.woff?url'
import montserrat700 from '@fontsource/montserrat/files/montserrat-latin-700-normal.woff?url'
import raleway400 from '@fontsource/raleway/files/raleway-latin-400-normal.woff?url'
import raleway500 from '@fontsource/raleway/files/raleway-latin-500-normal.woff?url'
import raleway600 from '@fontsource/raleway/files/raleway-latin-600-normal.woff?url'
import { registriereSchriften } from './fonts'

export function registerFonts(): void {
  registriereSchriften({ montserrat500, montserrat600, montserrat700, raleway400, raleway500, raleway600 })
}
