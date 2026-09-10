import { useEffect, useState } from 'react'

/** Gibt `wert` erst zurück, wenn er `verzoegerungMs` lang unverändert war – die PDF-Vorschau
 *  soll nicht bei jedem Tastendruck neu gerendert werden. */
export function useDebouncedValue<T>(wert: T, verzoegerungMs = 400): T {
  const [entprellt, setEntprellt] = useState(wert)
  useEffect(() => {
    const timer = setTimeout(() => setEntprellt(wert), verzoegerungMs)
    return () => clearTimeout(timer)
  }, [wert, verzoegerungMs])
  return entprellt
}
