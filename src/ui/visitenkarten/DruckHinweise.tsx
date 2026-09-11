const HINWEISE: Array<{ titel: string; text: string }> = [
  { titel: 'Endformat', text: '85 × 55 mm quer (Standard-Visitenkarte). Alle Layouts halten 5 mm Sicherheitsabstand zur Schnittkante – mit dem Schalter „Schnittkante & Sicherheitsbereich“ prüfbar.' },
  { titel: 'Druck-PDF', text: '91 × 61 mm inkl. 3 mm Beschnitt umlaufend, mit gesetzter Trim-Box. Seite 1 = Vorderseite, Seite 2 = Rückseite, gerastert mit 600 dpi (sRGB). „Verlustfrei“ bettet die Seiten unkomprimiert ein (größere Datei, keine JPEG-Artefakte).' },
  { titel: 'Drucken → Vektor-PDF', text: 'Öffnet beide Seiten in exakter physischer Größe im Druckdialog – dort „Als PDF sichern“ wählen. Text bleibt echter Vektor; Schnittmarken in den Ecken zeigen die Schnittkante.' },
  { titel: 'PNG 300 / 600 dpi', text: '300 dpi (1004 × 650 px) genügt für Online-Druckereien wie Flyeralarm, Vistaprint oder WIRmachenDRUCK; 600 dpi (2008 × 1299 px) für höchste Rasterqualität. Mit aktiviertem Beschnitt-Export „mit Beschnitt“ hochladen.' },
  { titel: 'SVG', text: 'Vektorquelle mit eingebetteten Schriften – beliebig skalierbar, editierbar in Illustrator, Inkscape oder Affinity. Für Profi-Druckereien oder Weiterbearbeitung.' },
  { titel: 'QR-Codes', text: 'Werden live aus den Kartendetails erzeugt (vCard mit Name, Rolle, Nummer, E-Mail, Adresse; Fehlerkorrektur M). Der QR-Link steuert den Code auf der Rückseite von Design 05 – Website, WhatsApp oder Instagram per Klick.' },
  { titel: 'Fotos', text: 'Team-Fotos der Website werden als runder Ausschnitt mit Goldring gesetzt, wie auf augusta-energy.de leicht entsättigt. „Eigenes Foto“ lädt ein beliebiges Bild (mittiger quadratischer Ausschnitt); das Foto lässt sich pro Export abschalten.' },
  { titel: 'Papierempfehlung', text: '350 g/m² Naturpapier oder Bilderdruck matt, gern mit Soft-Touch-Folie. Für die dunklen Karten lohnt Goldfolie oder partieller UV-Lack auf Marke und Goldlinien.' },
  { titel: 'Schriften', text: 'Montserrat und Raleway – identisch zur Website. In allen Exporten eingebettet; das Werkzeug läuft komplett im Browser.' },
]

export function DruckHinweise() {
  return (
    <section className="mt-6 border border-line bg-cream/40 p-5 md:p-6">
      <h2 className="eyebrow text-gold-deep">Druckdaten &amp; Hinweise</h2>
      <dl className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {HINWEISE.map((h) => (
          <div key={h.titel}>
            <dt className="eyebrow text-[0.62rem] text-ink-600">{h.titel}</dt>
            <dd className="mt-1 text-sm leading-relaxed text-ink-600">{h.text}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
