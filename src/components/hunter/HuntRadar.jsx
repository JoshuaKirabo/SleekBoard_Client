// Where the jobs sit on the scope: the angle clockwise from the top, and how far out from the middle (1 is the rim).
const BLIPS = [
  { at: 48, out: 0.58 },
  { at: 132, out: 0.8 },
  { at: 208, out: 0.42 },
  { at: 296, out: 0.72 },
];

// A blip's spot on the disc, in percent from its top-left corner.
const spotOf = ({ at, out }) =>
  {
    const angle = (at * Math.PI) / 180;
    return { left: `${50 + 50 * out * Math.sin(angle)}%`, top: `${50 - 50 * out * Math.cos(angle)}%` };
  };

// The Hunter's icon come to life: a scope with a beam sweeping round it. Each job it has found is a blip that lights
// up as the beam passes over it and dims until the next pass. `found` is how many blips are on the scope so far.
// They're all there from the start, only hidden, so every blip stays in step with the beam.
export default function HuntRadar({ found, size = 76 })
  {
    return (
      <span className="hunt-radar relative block shrink-0 overflow-hidden rounded-full bg-canvas" style={{ width: size, height: size }} aria-hidden="true">
        <span className="hunt-radar-ring absolute inset-0 rounded-full" />
        <span className="hunt-radar-ring absolute inset-[25%] rounded-full" />
        <span className="hunt-radar-beam absolute inset-0 rounded-full" />

        {BLIPS.map((blip, index) => (
          <span key={blip.at} className="absolute -translate-x-1/2 -translate-y-1/2 transition-opacity duration-500 ease-out-strong" style={{ ...spotOf(blip), opacity: index < found ? 1 : 0 }}>
            <span className="hunt-radar-blip block h-[5px] w-[5px] rounded-full bg-cream" style={{ "--at": blip.at }} />
          </span>
        ))}

        <span className="absolute top-1/2 left-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream" />
      </span>
    );
  }
