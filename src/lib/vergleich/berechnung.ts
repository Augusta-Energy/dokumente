import { gueltigBis, lieferende } from '../datum'
import { parseDezimal, zahlOder0 } from '../zahl'
import type { Tarif, VergleichDaten } from './types'

export type TarifErgebnis = {
  arbeitspreisCt: number
  arbeitspreisEur: number
  grundpreisJahr: number
  grundpreisEingabe: number
  jahreskosten: number
  abschlagMonat: number
  laufzeitkosten: number
}

export type VergleichErgebnis = {
  ustSatz: number
  faktorUst: number
  verbrauchKwh: number
  laufzeitMonate: number
  laufzeitJahre: number
  lieferende: string | null
  gueltigBis: string | null
  empfehlung: TarifErgebnis
  aktuell: TarifErgebnis
  ersparnisJahr: number
  ersparnisLaufzeit: number
  kaReduktionJahr: number
  kaReduktionLaufzeit: number
  honorarAnbieterwechsel: number
  honorarKonzessionsabgabe: number
  honorarSumme: number
  /** true, wenn das Honorar angezeigt werden soll und mindestens ein Betrag > 0 ist */
  honorarSichtbar: boolean
  gesamtersparnisLaufzeit: number
}

export function brutto(netto: number, faktorUst: number): number {
  return netto * faktorUst
}

function berechneTarif(t: Tarif, verbrauchKwh: number, laufzeitJahre: number): TarifErgebnis {
  const arbeitspreisCt = zahlOder0(t.arbeitspreisCt)
  const grundpreisEingabe = zahlOder0(t.grundpreis)
  const grundpreisJahr = grundpreisEingabe * (t.grundpreisEinheit === 'monat' ? 12 : 1)
  const arbeitspreisEur = arbeitspreisCt / 100
  const jahreskosten = arbeitspreisEur * verbrauchKwh + grundpreisJahr
  return {
    arbeitspreisCt,
    arbeitspreisEur,
    grundpreisJahr,
    grundpreisEingabe,
    jahreskosten,
    abschlagMonat: jahreskosten / 12,
    laufzeitkosten: jahreskosten * laufzeitJahre,
  }
}

export function berechneVergleich(d: VergleichDaten): VergleichErgebnis {
  const ustSatz = zahlOder0(d.vergleich.ustSatz)
  const faktorUst = 1 + ustSatz / 100
  const verbrauchKwh = zahlOder0(d.lieferstelle.jahresverbrauchKwh)
  const laufzeitRoh = parseDezimal(d.lieferstelle.laufzeitMonate)
  const laufzeitMonate = laufzeitRoh != null && laufzeitRoh > 0 ? Math.round(laufzeitRoh) : 0
  const laufzeitJahre = laufzeitMonate / 12

  const empfehlung = berechneTarif(d.empfehlung, verbrauchKwh, laufzeitJahre)
  const aktuell = berechneTarif(d.aktuell, verbrauchKwh, laufzeitJahre)

  const ersparnisJahr = aktuell.jahreskosten - empfehlung.jahreskosten
  const kaReduktionJahr = zahlOder0(d.konzessionsabgabe.reduktionProJahr)
  const honorarAnbieterwechsel = d.honorar.anzeigen ? zahlOder0(d.honorar.anbieterwechsel) : 0
  const honorarKonzessionsabgabe = d.honorar.anzeigen ? zahlOder0(d.honorar.konzessionsabgabe) : 0
  const honorarSumme = honorarAnbieterwechsel + honorarKonzessionsabgabe
  const ersparnisLaufzeit = ersparnisJahr * laufzeitJahre
  const kaReduktionLaufzeit = kaReduktionJahr * laufzeitJahre

  return {
    ustSatz,
    faktorUst,
    verbrauchKwh,
    laufzeitMonate,
    laufzeitJahre,
    lieferende: laufzeitMonate > 0 ? lieferende(d.lieferstelle.lieferbeginn, laufzeitMonate) : null,
    gueltigBis: gueltigBis(d.vergleich.datum, Math.round(zahlOder0(d.vergleich.gueltigkeitTage))),
    empfehlung,
    aktuell,
    ersparnisJahr,
    ersparnisLaufzeit,
    kaReduktionJahr,
    kaReduktionLaufzeit,
    honorarAnbieterwechsel,
    honorarKonzessionsabgabe,
    honorarSumme,
    honorarSichtbar: d.honorar.anzeigen && honorarSumme > 0,
    gesamtersparnisLaufzeit: ersparnisLaufzeit + kaReduktionLaufzeit - honorarSumme,
  }
}
