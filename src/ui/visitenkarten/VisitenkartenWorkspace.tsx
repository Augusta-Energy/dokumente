import { useCallback, useEffect, useMemo, useState } from 'react'
import { SCHRIFTEN_CSS } from '../../brand/fonts.svg.browser'
import type { Absender } from '../../lib/absender'
import { useLocalStorageState } from '../../lib/storage'
import { dateiBasis, pdfDateiname, pngDateiname, svgDateiname } from '../../lib/visitenkarten/dateiname'
import { DESIGNS, type Design } from '../../lib/visitenkarten/designs'
import { findePerson, PERSONEN, personKarte } from '../../lib/visitenkarten/personen'
import { renderKarte } from '../../lib/visitenkarten/render'
import { canvasMesser } from '../../lib/visitenkarten/textbreite'
import { BESCHNITT, FOTO_ID, type Farbwelt, type Foto, type Karte, type Messer, type Seite, type VisitenkartenZustand } from '../../lib/visitenkarten/typen'
import { useDebouncedValue } from '../useDebouncedValue'
import { DesignSektion, type ExportAktion } from './DesignSektion'
import { oeffneDruckansicht } from './druckansicht'
import { DruckHinweise } from './DruckHinweise'
import { exportierePdf, exportierePng, exportiereSvg, type SvgErzeuger } from './exporte'
import { ladeEigenesFoto, ladeTeamFoto } from './fotoLaden'
import { KartenPanel } from './KartenPanel'

export const VISITENKARTE_KEY = 'augusta-dokumente:v1:visitenkarte'
const ALLE_FARBWELTEN: readonly Farbwelt[] = ['hell', 'dunkel']
const SEITEN: readonly Seite[] = ['vorderseite', 'rueckseite']

// Modul-Ebene: überlebt das Neu-Mounten beim Tab-Wechsel; ein Reload wendet den Deep-Link erneut an, wie in der Spec.
let deepLinkGeprueft = false

function startZustand(absender: Absender): VisitenkartenZustand {
  return { personId: PERSONEN[0].id, karte: personKarte(PERSONEN[0], absender), fotoAnzeigen: true, hilfslinien: false, beschnittExport: false, farbwelt: 'beide' }
}

function fehlertext(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

export function VisitenkartenWorkspace({ absender }: { absender: Absender }) {
  const [start] = useState(() => startZustand(absender))
  const [zustand, setZustand] = useLocalStorageState<VisitenkartenZustand>(VISITENKARTE_KEY, start)
  const [foto, setFoto] = useState<Foto | null>(null)
  const [fotoQuelle, setFotoQuelle] = useState<'person' | 'eigen'>('person')
  const [fotoFehler, setFotoFehler] = useState<string | null>(null)
  const [messer, setMesser] = useState<Messer | undefined>(undefined)

  // Echte Textbreiten (für die textLength-Stauchung), sobald die Webfonts da sind
  useEffect(() => {
    let aktiv = true
    const bereit = typeof document !== 'undefined' && document.fonts ? document.fonts.ready : Promise.resolve()
    bereit.then(
      () => {
        if (aktiv) setMesser(() => canvasMesser() ?? undefined)
      },
      () => {},
    )
    return () => {
      aktiv = false
    }
  }, [])

  const ladePerson = useCallback(
    (id: string) => {
      const p = findePerson(id)
      if (!p) return
      setZustand((z) => ({ ...z, personId: p.id, karte: personKarte(p, absender) }))
      setFotoQuelle('person')
    },
    [absender, setZustand],
  )

  // Deep-Link ?person=<id> gewinnt beim ersten Rendern gegen den gespeicherten Zustand
  useEffect(() => {
    if (deepLinkGeprueft) return
    deepLinkGeprueft = true
    const id = new URLSearchParams(window.location.search).get('person')
    if (id) ladePerson(id)
  }, [ladePerson])

  // Team-Foto der gewählten Person laden; frei editierte Karten (personId null) behalten das Foto
  useEffect(() => {
    if (fotoQuelle !== 'person') return
    const p = findePerson(zustand.personId)
    if (!p) return
    setFotoFehler(null)
    if (!p.foto) {
      setFoto(null)
      return
    }
    let aktiv = true
    ladeTeamFoto(p).then(
      (f) => {
        if (aktiv) setFoto(f)
      },
      (e: unknown) => {
        if (aktiv) {
          setFoto(null)
          setFotoFehler(fehlertext(e))
        }
      },
    )
    return () => {
      aktiv = false
    }
  }, [zustand.personId, fotoQuelle])

  const setKarte = useCallback((karte: Karte) => setZustand((z) => ({ ...z, karte, personId: null })), [setZustand])
  const setOption = useCallback(
    <K extends keyof VisitenkartenZustand>(schluessel: K, wert: VisitenkartenZustand[K]) => setZustand((z) => ({ ...z, [schluessel]: wert })),
    [setZustand],
  )
  const onEigenesFoto = useCallback(
    async (datei: File) => {
      try {
        setFoto(await ladeEigenesFoto(datei))
        setFotoQuelle('eigen')
        setFotoFehler(null)
        setOption('fotoAnzeigen', true)
      } catch (e) {
        setFotoFehler(fehlertext(e))
      }
    },
    [setOption],
  )

  const entprellt = useDebouncedValue(zustand.karte, 150)
  const fotoAktiv = zustand.fotoAnzeigen ? foto : null
  const firma = absender.firma
  const { hilfslinien, farbwelt: farbweltWahl } = zustand
  const sichtbar: readonly Farbwelt[] = farbweltWahl === 'beide' ? ALLE_FARBWELTEN : [farbweltWahl]

  const vorschauen = useMemo(() => {
    const m = new Map<string, string>()
    const welten: readonly Farbwelt[] = farbweltWahl === 'beide' ? ALLE_FARBWELTEN : [farbweltWahl]
    for (const design of DESIGNS) {
      for (const farbwelt of welten) {
        for (const seite of SEITEN) {
          const svg = renderKarte(design, { karte: entprellt, firma, farbwelt, seite, beschnitt: hilfslinien ? BESCHNITT : 0, hilfslinien, modus: 'vorschau', foto: fotoAktiv, messer })
          m.set(`${design.id}|${farbwelt}|${seite}`, svg)
        }
      }
    }
    return m
  }, [entprellt, firma, farbweltWahl, hilfslinien, fotoAktiv, messer])

  const erzeuger = (design: Design, farbwelt: Farbwelt): SvgErzeuger => (seite, o) =>
    renderKarte(design, { karte: zustand.karte, firma, farbwelt, seite, beschnitt: o.beschnitt, schnittmarken: o.schnittmarken, modus: 'export', schriftenCss: SCHRIFTEN_CSS, foto: fotoAktiv, messer })

  const exportiere = async (design: Design, farbwelt: Farbwelt, aktion: ExportAktion): Promise<void> => {
    const e = erzeuger(design, farbwelt)
    const basis = dateiBasis(design, farbwelt, zustand.karte.name)
    const beschnitt = zustand.beschnittExport ? BESCHNITT : 0
    switch (aktion.art) {
      case 'svg':
        exportiereSvg(e, aktion.seite, beschnitt, svgDateiname(basis, aktion.seite, beschnitt > 0))
        break
      case 'png300':
        await exportierePng(e, aktion.seite, 300, beschnitt, pngDateiname(basis, aktion.seite, 300, beschnitt > 0))
        break
      case 'png600':
        await exportierePng(e, aktion.seite, 600, beschnitt, pngDateiname(basis, aktion.seite, 600, beschnitt > 0))
        break
      case 'pdf':
        await exportierePdf(e, false, pdfDateiname(basis, false))
        break
      case 'pdfVerlustfrei':
        await exportierePdf(e, true, pdfDateiname(basis, true))
        break
      case 'drucken':
        oeffneDruckansicht(e, basis)
        break
    }
  }

  return (
    <div>
      {foto ? (
        <svg width="0" height="0" aria-hidden="true" focusable="false" className="absolute">
          <defs>
            <image id={FOTO_ID} href={foto.src} width={foto.w} height={foto.h} />
          </defs>
        </svg>
      ) : null}
      <KartenPanel zustand={zustand} hatFoto={foto !== null} fotoFehler={fotoFehler} onPerson={ladePerson} onKarte={setKarte} onOption={setOption} onEigenesFoto={onEigenesFoto} />
      <div className="mt-8">
        {DESIGNS.map((design) => (
          <DesignSektion
            key={design.id}
            design={design}
            farbwelten={sichtbar}
            svg={(farbwelt, seite) => vorschauen.get(`${design.id}|${farbwelt}|${seite}`) ?? ''}
            onExport={(farbwelt, aktion) => exportiere(design, farbwelt, aktion)}
          />
        ))}
      </div>
      <DruckHinweise />
    </div>
  )
}
