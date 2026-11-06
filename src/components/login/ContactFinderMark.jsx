import { useId, useRef } from "react";
import { travel, useLap } from "./markMotion.js";

// One lap of the glass, in milliseconds. It lifts off the person's side, stops at the head, slides down across the
// chest, then settles back where it started and rests before going round again.
const LAP = 4200;

// Where the glass stops and when, as a share of the lap. Each pair is held still, then the glass travels to the next.
// The stops hold long enough to read as looking, not wandering.
const STOPS = [
  { at: 0, x: 0, y: 0 },
  { at: 0.12, x: 0, y: 0 },
  { at: 0.3, x: -3.6, y: -9.4 },
  { at: 0.44, x: -3.6, y: -9.4 },
  { at: 0.62, x: -9.6, y: 0.6 },
  { at: 0.74, x: -9.6, y: 0.6 },
  { at: 0.92, x: 0, y: 0 },
  { at: 1, x: 0, y: 0 },
];

// Where the glass is at a point in its lap, from 0 to 1.
const glassAt = (lap) =>
  {
    const next = STOPS.findIndex((stop) => stop.at > lap);
    const from = STOPS[next - 1];
    const to = STOPS[next];
    const eased = travel((lap - from.at) / (to.at - from.at));
    return { x: from.x + (to.x - from.x) * eased, y: from.y + (to.y - from.y) * eased };
  };

// Draws one frame: the glass and the cut that follows it in the mask both go to where the glass is. Setting the
// transform attribute is what makes the cut in the mask follow.
const drawFrame = (lap, groups) =>
  {
    const { x, y } = glassAt(lap);
    groups.forEach((group) => group.current?.setAttribute("transform", `translate(${x.toFixed(3)} ${y.toFixed(3)})`));
  };

// The person, after the reference Josh picked: short hair, ears, a neck and an open V collar. The collar is cut out of
// the shirt, so it shows the background the way the white collar does in the reference.
const HEAD = "M10.2 1.2C12.9 1.2 14.4 2.8 14.4 5.6L14.3 7.4C14.9 7.3 15.2 7.8 15 8.6C14.8 9.4 14.4 9.8 13.9 9.7C13.5 11 12.6 11.9 11.9 12.3L11.9 14.2L8.1 14.2L8.1 12.3C7.4 11.9 6.5 11 6.1 9.7C5.6 9.8 5.2 9.4 5 8.6C4.8 7.8 5.1 7.3 5.7 7.4L5.7 6C5.7 4.6 6.1 3.6 6.8 3C7.4 1.9 8.6 1.2 10.2 1.2Z";
const SHIRT = "M1.4 22.6C1.4 18 3.4 15.2 7.2 14L12.8 14C16.6 15.2 18.6 18 18.6 22.6C18.6 23.1 18.2 23.4 17.7 23.4L2.3 23.4C1.8 23.4 1.4 23.1 1.4 22.6Z M7.2 14L10 18.6L12.8 14L11.9 14L10 16.9L8.1 14Z";

// The Contact Finder mark beside its name on the login screen: a person, with a magnifying glass looking them over.
// The glass keeps moving round the person, so it reads as someone being found. Wherever it passes, the person is
// cut away under the lens and in a thin gap round its rim, so the glass always reads clear of them.
export default function ContactFinderMark({ className = "" })
  {
    const cutId = useId();
    const cut = useRef(null);
    const glass = useRef(null);
    const groups = useRef([cut, glass]).current;
    useLap(LAP, drawFrame, groups);

    return (
      <svg viewBox="-1 -1 26 26" className={className} aria-hidden="true">
        <defs>
          <mask id={cutId} maskUnits="userSpaceOnUse" x="-1" y="-1" width="26" height="26">
            <rect x="-1" y="-1" width="26" height="26" fill="#fff" />
            <g ref={cut}>
              <circle cx="17.4" cy="16.6" r="5.5" fill="#000" />
              <path d="M20.3 19.5L23 22.2" stroke="#000" strokeWidth="5" strokeLinecap="round" />
            </g>
          </mask>
        </defs>

        <g fill="currentColor" mask={`url(#${cutId})`}>
          <path d={HEAD} />
          <path d={SHIRT} fillRule="evenodd" />
        </g>

        <g ref={glass} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
          <circle cx="17.4" cy="16.6" r="3.7" fill="currentColor" fillOpacity="0.14" />
          <path d="M20.3 19.5L23 22.2" />
        </g>
      </svg>
    );
  }
