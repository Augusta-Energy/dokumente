import { Page, Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import type { Absender } from '../../lib/absender'
import { styles } from '../theme'
import { LogoPdf } from './LogoPdf'

/** Fußzeilen: Zeile 3 (Bank) und die USt-IdNr erscheinen nur, wenn gepflegt. */
export function fusszeilen(a: Absender): string[] {
  const zeile1 = `${a.firma} · Inhaber: ${a.inhaber} · ${a.strasse} · ${a.plz} ${a.ort}`
  const zeile2 = [`Telefon ${a.telefon}`, a.email, a.web, a.ustIdNr.trim() ? `USt-IdNr. ${a.ustIdNr.trim()}` : '']
    .filter(Boolean)
    .join(' · ')
  const bank = [a.bank.trim(), a.iban.trim() ? `IBAN ${a.iban.trim()}` : ''].filter(Boolean).join(' · ')
  const zeile3 = bank ? `Bankverbindung: ${bank}` : ''
  return [zeile1, zeile2, zeile3].filter(Boolean)
}

type Props = { absender: Absender; laufzeile?: string; children: ReactNode }

/** A4-Seite mit festem Kopf (Logo + Kontakt + Goldlinie) und Fuß (Firmenzeilen + „Seite x von y“). */
export function PageFrame({ absender, laufzeile, children }: Props) {
  return (
    <Page size="A4" style={styles.seite}>
      <View fixed style={styles.kopf}>
        <LogoPdf hoehe={30} />
        <View style={styles.kopfKontakt}>
          <Text>{`${absender.firma} · ${absender.strasse} · ${absender.plz} ${absender.ort}`}</Text>
          <Text>{`Telefon ${absender.telefon} · ${absender.email} · ${absender.web}`}</Text>
        </View>
      </View>
      {laufzeile ? <Text style={styles.laufzeile}>{laufzeile}</Text> : null}
      {children}
      <View fixed style={styles.fuss}>
        <View>
          {fusszeilen(absender).map((zeile) => (
            <Text key={zeile} style={styles.fussText}>{zeile}</Text>
          ))}
        </View>
        <Text style={styles.fussText} render={({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}`} />
      </View>
    </Page>
  )
}
