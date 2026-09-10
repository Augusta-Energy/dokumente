import { Text, View } from '@react-pdf/renderer'
import { farben } from '../../brand/colors'
import { styles } from '../theme'

export type KeyValue = { label: string; wert: string }

export function KeyValueGrid({ eintraege, spalten = 3 }: { eintraege: KeyValue[]; spalten?: 2 | 3 }) {
  const breite = `${100 / spalten}%`
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: farben.line, marginBottom: 6 }}>
      {eintraege.map((e) => (
        <View key={e.label} style={{ width: breite, paddingVertical: 3, paddingRight: 8, borderBottomWidth: 1, borderBottomColor: farben.line }}>
          <Text style={styles.label}>{e.label}</Text>
          <Text style={{ marginTop: 2, fontWeight: 500 }}>{e.wert}</Text>
        </View>
      ))}
    </View>
  )
}
