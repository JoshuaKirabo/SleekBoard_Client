// The two halves of the SleekBoard logomark, from src/assets/brand/mark-white.svg. The top one is you, the bottom
// one is a job, and when they lock together you have the logo.
const TOP_HALF = "M0,0V44.07H13a34.3,34.3,0,0,1,68.4,0H93.31V0Z";
const BOTTOM_HALF = "M134,75.22V31.15H121a34.3,34.3,0,0,1-68.4,0H40.65V75.22Z";

// The jobs on the belt, by how many places each sits from the one under you. The belt moves one place per beat,
// so the job one place to the left (-1) is the one that arrives and locks in. Place 0 is where it stops, which is
// all reduced motion shows.
const BELT = [-2, -1, 0, 1];

// The hunt, drawn with the logo. You hold still at the top while a belt of jobs slides along underneath. Each beat,
// the one that arrives under you springs up and clicks into place, the whole mark flashes as it locks, and then it
// drops back onto the belt as the next one comes along. The belt fades out at both ends, so it never seems to stop.
export default function HuntMark({ height = 64 })
  {
    return (
      <svg className="hunt-mark shrink-0 overflow-visible" viewBox="-60 -8 254 106" style={{ height }} aria-hidden="true">
        <g className="hunt-mark-belt">
          {BELT.map((place) => (
            <g key={place} transform={`translate(${place * 117} 0)`}>
              <path d={BOTTOM_HALF} className={`hunt-mark-job ${place === -1 ? "hunt-mark-match" : ""} ${place === 0 ? "hunt-mark-home" : ""}`} />
            </g>
          ))}
        </g>
        <path d={TOP_HALF} className="hunt-mark-you" />
      </svg>
    );
  }
