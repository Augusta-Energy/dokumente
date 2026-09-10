# Augusta Energy · Dokumente

Interner Generator für zwei PDF-Dokumente, die aus Formulareingaben erzeugt werden – komplett im Browser, ohne Server:

- **Energie-Vergleich** (Strom oder Gas): dreiseitiges Angebot mit Anschreiben, Vergleich auf einen Blick und Konditionen im Detail. Jahreskosten, Abschläge, Brutto-Werte und Ersparnis rechnet die App selbst.
- **Vollmacht**: beschränkt auf Angelegenheiten der Strom-/Gasversorgung der genannten Lieferstellen (Auskünfte, Angebote, Vertragsabschluss und -kündigung, Lieferantenwechsel, Rechnungsprüfung). Alles andere ist ausdrücklich ausgeschlossen.

Live: https://augusta-energy.github.io/dokumente/ (öffentlich erreichbar, aber per `noindex` und `robots.txt` von Suchmaschinen ausgeschlossen).

## Entwicklung

```bash
npm install
npm run dev              # http://localhost:5173/dokumente/
npm test                 # Vitest (Berechnung, Formatierung, PDF-Rendering)
npm run lint             # oxlint
npm run build            # tsc + vite build → dist/
npm run render:beispiele # schreibt out/Energie-Vergleich.pdf und out/Vollmacht.pdf mit Beispieldaten
```

Node ≥ 24.

## Aufbau

- `src/lib` – reine Fachlogik: Zahlen/Datum/Formatierung, Berechnung des Vergleichs, Vollmacht-Texte, Pflichtfelder.
- `src/pdf` – die beiden Dokumente auf Basis von `@react-pdf/renderer` plus gemeinsame Bausteine (Seitenrahmen, Tabellen, Highlight).
- `src/ui` – Formulare, Vorschau und Absender-Einstellungen.
- `src/brand` – Farben, Logo-Geometrie und Schriften (Montserrat/Raleway via Fontsource).

Firmendaten und Ansprechpartner werden in der App unter „Absender“ gepflegt (im Browser gespeichert). Die Standardwerte stehen in `src/lib/absender.ts`.

## Deployment

Jeder Push auf `main` baut die Seite (Lint, Tests, Build) und veröffentlicht sie über GitHub Actions auf GitHub Pages (`.github/workflows/deploy.yml`).

## Hinweis zur Vollmacht

Der Vollmachtstext ist eine sorgfältig formulierte Vorlage, aber keine Rechtsberatung. Vor dem produktiven Einsatz sollte ein Rechtsanwalt den Text prüfen.
