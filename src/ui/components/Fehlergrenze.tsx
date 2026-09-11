import { Component, type ReactNode } from 'react'
import { Button } from './Button'

type Props = { speicherKey: string; children: ReactNode }
type State = { fehler: Error | null }

/** Fängt Rendering-Fehler des umschlossenen Reiters ab, statt die ganze App abstürzen zu lassen. */
export class Fehlergrenze extends Component<Props, State> {
  state = { fehler: null as Error | null }

  static getDerivedStateFromError(fehler: Error) {
    return { fehler }
  }

  private zuruecksetzen = () => {
    try {
      window.localStorage.removeItem(this.props.speicherKey)
    } catch {
      // Speicher gesperrt oder nicht verfügbar – der Reload hilft trotzdem meist.
    }
    window.location.reload()
  }

  render() {
    const { fehler } = this.state
    if (fehler) {
      return (
        <div role="alert" className="border border-red-700 bg-red-50 p-4 text-sm text-red-800">
          <p>Dieser Reiter konnte nicht dargestellt werden: {fehler.message}</p>
          <Button klein className="mt-3" onClick={this.zuruecksetzen}>Eingaben dieses Reiters zurücksetzen</Button>
        </div>
      )
    }
    return this.props.children
  }
}
