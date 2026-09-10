import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/montserrat/latin-500.css'
import '@fontsource/montserrat/latin-600.css'
import '@fontsource/montserrat/latin-700.css'
import '@fontsource/raleway/latin-400.css'
import '@fontsource/raleway/latin-500.css'
import '@fontsource/raleway/latin-600.css'
import './index.css'
import { registerFonts } from './brand/fonts.browser'
import { App } from './App'

registerFonts()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
