import { Text, View } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { GROESSE, styles } from '../theme'

export function SectionTitle({ eyebrow, titel }: { eyebrow?: string; titel: string }) {
  return (
    <View style={{ marginBottom: 2 }}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.titel}>{titel}</Text>
      <View style={styles.goldRule} />
    </View>
  )
}

export function Ueberschrift({ children }: { children: string }) {
  return <Text style={styles.ueberschrift}>{children}</Text>
}

export function Absatz({ children, klein = false, fett = false, abstand = 6 }: { children: ReactNode; klein?: boolean; fett?: boolean; abstand?: number }) {
  return (
    <Text style={{ marginBottom: abstand, fontSize: klein ? GROESSE.klein : GROESSE.text, fontWeight: fett ? 600 : 400 }}>
      {children}
    </Text>
  )
}

/** „Leitwort: Text“ – das Leitwort in Gold (Markenkonvention der Website). */
export function ColonLead({ lead, text }: { lead: string; text: string }) {
  return (
    <Text style={styles.absatz}>
      <Text style={[styles.fett, styles.gold]}>{`${lead}: `}</Text>
      {text}
    </Text>
  )
}

export function Fussnoten({ zeilen }: { zeilen: string[] }) {
  return (
    <View style={{ marginTop: 14 }}>
      {zeilen.map((zeile) => (
        <Text key={zeile} style={styles.fussnote}>{zeile}</Text>
      ))}
    </View>
  )
}
