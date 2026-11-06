import { useElementSize } from "./useElementSize.js";

// The outline of a panel with its top right corner stepped down, like a tab cut out of it. Every corner, the two
// inside the step included, gets the same rounding. The radius shrinks if the step is too small to fit it.
export function notchedPath(width, height, { notchWidth, notchHeight, radius })
  {
    const r = Math.min(radius, notchWidth / 2, notchHeight / 2);
    const stepX = width - notchWidth;

    return [
      `M ${r} 0`,
      `H ${stepX - r}`,
      `A ${r} ${r} 0 0 1 ${stepX} ${r}`,
      `V ${notchHeight - r}`,
      `A ${r} ${r} 0 0 0 ${stepX + r} ${notchHeight}`,
      `H ${width - r}`,
      `A ${r} ${r} 0 0 1 ${width} ${notchHeight + r}`,
      `V ${height - r}`,
      `A ${r} ${r} 0 0 1 ${width - r} ${height}`,
      `H ${r}`,
      `A ${r} ${r} 0 0 1 0 ${height - r}`,
      `V ${r}`,
      `A ${r} ${r} 0 0 1 ${r} 0`,
      "Z",
    ].join(" ");
  }

// A box clipped to that stepped outline. The path is redrawn from the box's real size, so the curves stay round
// at any width instead of stretching like a scaled SVG would.
export default function NotchedPanel({ notch, className = "", style, children })
  {
    const [ref, size] = useElementSize();
    const clipPath = size ? `path("${notchedPath(size.width, size.height, notch)}")` : undefined;

    return (
      <div ref={ref} className={className} style={{ ...style, clipPath }}>
        {children}
      </div>
    );
  }
