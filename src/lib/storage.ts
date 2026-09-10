import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react'

function istObjekt(w: unknown): w is Record<string, unknown> {
  return typeof w === 'object' && w !== null && !Array.isArray(w)
}

export function browserStorage(): Storage | undefined {
  try {
    return typeof window !== 'undefined' ? window.localStorage : undefined
  } catch {
    return undefined
  }
}

export function lesen<T>(key: string, fallback: T, storage: Storage | undefined = browserStorage()): T {
  try {
    const roh = storage?.getItem(key)
    if (roh == null) return fallback
    const wert = JSON.parse(roh) as unknown
    if (istObjekt(fallback)) return istObjekt(wert) ? ({ ...fallback, ...wert } as T) : fallback
    return wert as T
  } catch {
    return fallback
  }
}

export function schreiben<T>(key: string, wert: T, storage: Storage | undefined = browserStorage()): void {
  try {
    storage?.setItem(key, JSON.stringify(wert))
  } catch {
    // Speicher voll oder gesperrt – die App funktioniert auch ohne Persistenz.
  }
}

/** React-State, der in localStorage gespiegelt wird. Der dritte Rückgabewert setzt auf `initial` zurück. */
export function useLocalStorageState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [wert, setWert] = useState<T>(() => lesen(key, initial))
  useEffect(() => {
    schreiben(key, wert)
  }, [key, wert])
  const zuruecksetzen = useCallback(() => setWert(initial), [initial])
  return [wert, setWert, zuruecksetzen]
}
