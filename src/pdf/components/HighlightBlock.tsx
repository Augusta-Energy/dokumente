import { Text, View } from '@react-pdf/renderer'
import { farben } from '../../brand/colors'
import { SCHRIFT } from '../../brand/fonts'

/** Ink-Block mit goldener Kante: Kernaussage links, große Goldzahl rechts. */
export function HighlightBlock({ text, wert, hinweis }: { text: string; wert?: string; hinweis?: string }) {
  return (
    <View
      wrap={false}
      style={{
        backgroundColor: farben.ink,
        borderLeftWidth: 3,
        borderLeftColor: farben.gold,
        paddingVertical: 14,
        paddingHorizontal: 18,
        marginTop: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flex: 1, paddingRight: 14 }}>
        <Text style={{ fontFamily: SCHRIFT.display, fontSize: 7, fontWeight: 600, letterSpacing: 1.6, textTransform: 'uppercase', color: farben.cream }}>{text}</Text>
        {hinweis ? <Text style={{ color: farben.cream, fontSize: 8.5, marginTop: 5, lineHeight: 1.4 }}>{hinweis}</Text> : null}
      </View>
      {wert ? <Text style={{ fontFamily: SCHRIFT.display, fontSize: 21, fontWeight: 700, color: farben.gold }}>{wert}</Text> : null}
    </View>
  )
}
