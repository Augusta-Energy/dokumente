import { Polygon, Svg, Text, View } from '@react-pdf/renderer'
import { farben } from '../../brand/colors'
import { SCHRIFT } from '../../brand/fonts'
import { BAR_POINTS, CHEVRON_POINTS, LEG_POINTS, MARKE_VIEWBOX } from '../../brand/logoGeometry'

/** Logo für PDFs: A-Marke als Vektor, Wortmarke als gesetzter Text (react-pdf kennt kein textLength). */
export function LogoPdf({ hoehe = 30, hell = false }: { hoehe?: number; hell?: boolean }) {
  const base = hell ? farben.cream : farben.ink
  const markeBreite = hoehe * (MARKE_VIEWBOX.breite / MARKE_VIEWBOX.hoehe)
  const wortGroesse = hoehe * 0.46
  const energyGroesse = hoehe * 0.21
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Svg viewBox={`0 0 ${MARKE_VIEWBOX.breite} ${MARKE_VIEWBOX.hoehe}`} style={{ width: markeBreite, height: hoehe }}>
        <Polygon points={CHEVRON_POINTS} fill={base} />
        <Polygon points={LEG_POINTS} fill={farben.gold} />
        <Polygon points={BAR_POINTS} fill={farben.gold} />
      </Svg>
      <View style={{ marginLeft: hoehe * 0.32 }}>
        <Text style={{ fontFamily: SCHRIFT.display, fontWeight: 600, fontSize: wortGroesse, letterSpacing: wortGroesse * 0.24, color: base, lineHeight: 1 }}>
          AUGUSTA
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: hoehe * 0.08 }}>
          <View style={{ flex: 1, height: 0.8, backgroundColor: farben.gold }} />
          <Text style={{ fontFamily: SCHRIFT.display, fontWeight: 600, fontSize: energyGroesse, letterSpacing: energyGroesse * 0.34, color: farben.gold, marginHorizontal: hoehe * 0.14, lineHeight: 1 }}>
            ENERGY
          </Text>
          <View style={{ flex: 1, height: 0.8, backgroundColor: farben.gold }} />
        </View>
      </View>
    </View>
  )
}
