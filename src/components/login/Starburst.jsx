// How far each spike reaches, as a share of the full radius, going round clockwise from the top. Uneven on purpose
// so the star reads as drawn and not stamped.
const SPIKES = [1, 0.62, 0.9, 0.7, 1, 0.66, 0.84, 0.6, 0.96, 0.7, 0.88, 0.64];
const RADIUS = 150;
const WAIST = 16;

// The corners of the star outline: a spike tip, then a point on the small waist halfway to the next tip.
function starPoints()
  {
    const step = (Math.PI * 2) / SPIKES.length;

    return SPIKES.flatMap((reach, index) =>
      {
        const tip = index * step - Math.PI / 2;
        const waist = tip + step / 2;
        return [
          `${(Math.cos(tip) * RADIUS * reach).toFixed(1)},${(Math.sin(tip) * RADIUS * reach).toFixed(1)}`,
          `${(Math.cos(waist) * WAIST).toFixed(1)},${(Math.sin(waist) * WAIST).toFixed(1)}`,
        ];
      }).join(" ");
  }

const POINTS = starPoints();

// The line star behind the quote. Cream at the top cooling to Board Blue, and gone by the bottom so the card
// that sits over it doesn't cut through bright lines.
export default function Starburst({ className = "" })
  {
    return (
      <svg viewBox="-160 -160 320 320" aria-hidden="true" className={className}>
        <defs>
          <linearGradient id="starburst-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dbd8ce" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#7a9fb6" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7a9fb6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={POINTS} fill="none" stroke="url(#starburst-stroke)" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }
