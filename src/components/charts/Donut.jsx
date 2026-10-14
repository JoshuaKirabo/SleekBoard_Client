// Three arcs with breathing room between them. Round caps eat into each arc, so the gap
// is measured from cap to cap rather than from the raw dash lengths.
export default function Donut({ segments, size = 128, thickness = 12, gap = 8, label })
  {
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);
    const trim = gap + thickness;

    let cursor = 0;
    const arcs = segments.map((segment) =>
      {
        const span = (segment.value / total) * circumference;
        const arc = { ...segment, length: Math.max(0, span - trim), start: cursor + trim / 2 };
        cursor += span;
        return arc;
      });

    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label}>
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {arcs.map((arc) => (
            <circle key={arc.name} cx={size / 2} cy={size / 2} r={radius} fill="none" className={arc.stroke} strokeWidth={thickness} strokeLinecap="round" strokeDasharray={`${arc.length} ${circumference - arc.length}`} strokeDashoffset={-arc.start} />
          ))}
        </g>
      </svg>
    );
  }
