import { useMemo } from 'react'
import { Document, Page, Text } from '@react-pdf/renderer'
import { Logo } from './brand/Logo'
import { DocumentWorkspace } from './ui/DocumentWorkspace'

export function App() {
  const dokument = useMemo(
    () => (
      <Document title="Vorschau">
        <Page size="A4" style={{ padding: 48, fontSize: 11 }}>
          <Text>Augusta Energy · Vorschau der Werkzeugleiste. Das Formular folgt im nächsten Schritt.</Text>
        </Page>
      </Document>
    ),
    [],
  )
  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8">
      <header className="flex items-center justify-between border-b border-line pb-6">
        <Logo className="h-10 w-auto" />
        <span className="eyebrow text-gold-deep">Dokumente</span>
      </header>
      <main className="py-10">
        <DocumentWorkspace dokument={dokument} dateiname="Vorschau.pdf" fehlendeFelder={[]} onBeispiel={() => {}} onZuruecksetzen={() => {}}>
          <p className="text-ink-600">Formular folgt im nächsten Schritt.</p>
        </DocumentWorkspace>
      </main>
    </div>
  )
}
