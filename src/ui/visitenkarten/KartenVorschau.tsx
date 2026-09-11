/** Inline-SVG einer Kartenseite, auf Spaltenbreite skaliert, mit Kartenschatten. */
export function KartenVorschau({ svg, beschriftung }: { svg: string; beschriftung: string }) {
  return (
    <figure>
      <figcaption className="eyebrow mb-2 flex justify-between text-[0.62rem] text-muted">
        <span>{beschriftung}</span>
        <span className="normal-case">85 × 55 mm</span>
      </figcaption>
      <div
        className="[&>svg]:block [&>svg]:h-auto [&>svg]:w-full [&>svg]:shadow-[0_14px_34px_rgba(17,19,21,0.18),0_2px_6px_rgba(17,19,21,0.12)]"
        dangerouslySetInnerHTML={{ __html: svg.replace(/^<\?xml[^>]*>\n?/, '') }}
      />
    </figure>
  )
}
