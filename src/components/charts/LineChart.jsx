import { useId } from "react";

// Catmull-Rom through every reading so the line bends instead of elbowing at each point.
const smoothPath = (points) =>
  {
    if(points.length < 2) return "";

    let d = `M${points[0].x} ${points[0].y}`;

    for(let i = 0; i < points.length - 1; i++)
      {
        const before = points[i - 1] || points[i];
        const from = points[i];
        const to = points[i + 1];
        const after = points[i + 2] || to;
        const c1x = from.x + (to.x - before.x) / 6;
        const c1y = from.y + (to.y - before.y) / 6;
        const c2x = to.x - (after.x - from.x) / 6;
        const c2y = to.y - (after.y - from.y) / 6;
        d += ` C${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
      }

    return d;
  };

// Day marks start at the left edge and stop a little short of the right, the line itself runs edge to edge.
const MARK_SPAN = 93;
const markX = (i, count) => (i / (count - 1)) * MARK_SPAN;

// The svg stretches to whatever width the card gives it, so strokes are told not to stretch with it.
export default function LineChart({ values, labels, height = 150, label })
  {
    const gradientId = useId();
    const max = Math.max(...values);
    const min = Math.min(...values);
    const top = 14;
    const bottom = height - 10;
    const points = values.map((value, i) => (
      {
        x: (i / (values.length - 1)) * 100,
        y: bottom - ((value - min) / (max - min || 1)) * (bottom - top),
      }));
    const line = smoothPath(points);
    const area = `${line} L100 ${height} L0 ${height} Z`;

    return (
      <div className="flex flex-1 flex-col">
        {/* The svg is pinned inside a sized box, otherwise it keeps asking for more height forever. */}
        <div className="relative min-h-[150px] flex-1">
          <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="absolute inset-0 block h-full w-full" role="img" aria-label={label}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-cream)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--color-cream)" stopOpacity="0" />
              </linearGradient>
            </defs>

            {labels.map((text, i) => (
              <line key={text} x1={markX(i, labels.length)} x2={markX(i, labels.length)} y1="0" y2={height} className="stroke-line-strong" vectorEffect="non-scaling-stroke" />
            ))}

            <path d={area} fill={`url(#${gradientId})`} />
            <path d={line} fill="none" className="stroke-cream" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>

        {/* Labels hang off the same marks as the lines. The first one starts at its mark so it never clips the card. */}
        <div className="relative mt-2 h-4 text-[11px] text-ink-3">
          {labels.map((text, i) => (
            <span key={text} className={`absolute top-0 whitespace-nowrap ${i === 0 ? "" : "-translate-x-1/2"}`} style={{ left: `${markX(i, labels.length)}%` }}>{text}</span>
          ))}
        </div>
      </div>
    );
  }
