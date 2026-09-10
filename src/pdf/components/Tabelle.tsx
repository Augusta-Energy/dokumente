import { Text, View } from '@react-pdf/renderer'
import { farben } from '../../brand/colors'
import { styles } from '../theme'

export type TabellenSpalte = { label: string; flex?: number; align?: 'left' | 'right'; hervorgehoben?: boolean }
/** `span`: zellen[1] erstreckt sich über alle Spalten rechts der ersten. */
export type TabellenZeile = { zellen: string[]; fett?: boolean; span?: boolean }

export function Tabelle({ spalten, zeilen }: { spalten: TabellenSpalte[]; zeilen: TabellenZeile[] }) {
  const restFlex = spalten.slice(1).reduce((summe, s) => summe + (s.flex ?? 1), 0)
  return (
    <View style={{ marginBottom: 7 }}>
      <View style={{ flexDirection: 'row', backgroundColor: farben.cream }}>
        {spalten.map((s, i) => (
          <View
            key={i}
            style={{
              flex: s.flex ?? 1,
              paddingVertical: 3,
              paddingHorizontal: 6,
              borderTopWidth: s.hervorgehoben ? 2 : 0,
              borderTopColor: farben.gold,
            }}
          >
            <Text style={[styles.label, { textAlign: s.align ?? 'left', color: s.hervorgehoben ? farben.goldDeep : farben.muted }]}>{s.label}</Text>
          </View>
        ))}
      </View>
      {zeilen.map((z, zi) => {
        const zellen = z.span ? [z.zellen[0], z.zellen[1]] : z.zellen
        return (
          <View
            key={zi}
            wrap={false}
            style={{
              flexDirection: 'row',
              borderBottomWidth: 1,
              borderBottomColor: farben.line,
              borderTopWidth: z.fett ? 1 : 0,
              borderTopColor: farben.ink,
            }}
          >
            {zellen.map((zelle, i) => {
              const spalte = spalten[i]
              const flex = z.span && i === 1 ? restFlex : (spalte?.flex ?? 1)
              const hervorgehoben = !z.span && spalte?.hervorgehoben
              return (
                <View key={i} style={{ flex, paddingVertical: 3, paddingHorizontal: 6, backgroundColor: hervorgehoben ? farben.goldTint : undefined }}>
                  <Text style={{ textAlign: z.span && i === 1 ? 'left' : (spalte?.align ?? 'left'), fontWeight: z.fett ? 600 : 400 }}>{zelle}</Text>
                </View>
              )
            })}
          </View>
        )
      })}
    </View>
  )
}
