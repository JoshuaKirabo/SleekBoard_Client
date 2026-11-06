import { useId, useRef } from "react";
import { steady, through, travel, useLap } from "./markMotion.js";

// One lap of the pen, in milliseconds.
const LAP = 4800;

// The lines on the page, top to bottom, each with where the pen writes it in the lap. The third stops short, where
// the pen rests when it's done.
const LINES = [
  { y: 9.4, from: 5.4, to: 13.6, writes: [0.12, 0.24] },
  { y: 12.4, from: 5.4, to: 13.2, writes: [0.29, 0.41] },
  { y: 15.4, from: 5.4, to: 10.2, writes: [0.46, 0.53] },
  { y: 19.4, from: 5.4, to: 13.6, writes: [0.58, 0.7] },
];

// Where the pen's nib rests, by the end of the third line, as in the reference.
const REST = { x: 11.4, y: 17.6 };

// The pen leaves its rest, then goes back to it, and the written page holds a beat before it fades for the next lap.
const LEAVES = [0.06, 0.12];
const RETURNS = [0.7, 0.78];
const FADES = [0.84, 0.94];

// The pen, drawn with its nib at REST. Moving it moves the nib to wherever the ink is.
const PEN = "M12.18 14.98l8.2-8.2a1.3 1.3 0 0 1 1.84 1.84l-8.2 8.2-2.62.78z";
const PEN_BAND = "M18.26 8.9l1.84 1.84";

// The pen without its nib, for the cut in the ink: the ink has to run right up to the nib, so only the body clears it.
const PEN_BODY = "M12.18 14.98l8.2-8.2a1.3 1.3 0 0 1 1.84 1.84l-8.2 8.2z";

// A point a share of the way from one place to another.
const between = (from, to, share) => ({ x: from.x + (to.x - from.x) * share, y: from.y + (to.y - from.y) * share });

const lineStart = (line) => ({ x: line.from, y: line.y });
const lineEnd = (line) => ({ x: line.to, y: line.y });

// How much of a line is written at a point in the lap. Everything is written once the pen's done, until the next lap.
const writtenShare = (line, lap) => steady(through(lap, ...line.writes));

// Where the nib is at a point in the lap: leaving its rest for the first line, writing a line, lifting across to the
// next one, or heading back to rest once the page is full.
const nibAt = (lap) =>
  {
    if(lap < LEAVES[1]) return between(REST, lineStart(LINES[0]), travel(through(lap, ...LEAVES)));
    if(lap >= RETURNS[0]) return between(lineEnd(LINES.at(-1)), REST, travel(through(lap, ...RETURNS)));

    const writing = LINES.findLast((line) => lap >= line.writes[0]);
    if(writing && lap < writing.writes[1]) return between(lineStart(writing), lineEnd(writing), writtenShare(writing, lap));

    const done = LINES.findLast((line) => lap >= line.writes[1]);
    const next = LINES[LINES.indexOf(done) + 1];
    return between(lineEnd(done), lineStart(next), travel(through(lap, done.writes[1], next.writes[0])));
  };

// Draws one frame: the pen and the gaps it cuts in the page and the ink go to the nib, each line shows as much as is written,
// and the page fades out at the end of the lap.
const drawFrame = (lap, { pen, cut, inkCut, ink }) =>
  {
    const nib = nibAt(lap);
    const shift = `translate(${(nib.x - REST.x).toFixed(3)} ${(nib.y - REST.y).toFixed(3)})`;
    pen.current?.setAttribute("transform", shift);
    cut.current?.setAttribute("transform", shift);
    inkCut.current?.setAttribute("transform", shift);

    const lines = ink.current?.children || [];
    LINES.forEach((line, index) => lines[index]?.setAttribute("stroke-dashoffset", (1 - writtenShare(line, lap)).toFixed(4)));
    ink.current?.setAttribute("opacity", (1 - through(lap, ...FADES)).toFixed(3));
  };

// The Fill In mark beside its name on the login screen: a page with its corner folded and a pen that writes its
// lines, one after another, then rests while the page holds before it fades and starts again. The pen cuts a thin
// gap in the page's outline and in any lines it crosses, so it always reads as lying on top. Drawn in the same outline and weight
// as the other marks.
export default function FillInMark({ className = "" })
  {
    const cutId = useId();
    const inkCutId = useId();
    const pen = useRef(null);
    const cut = useRef(null);
    const inkCut = useRef(null);
    const ink = useRef(null);
    const parts = useRef({ pen, cut, inkCut, ink }).current;
    useLap(LAP, drawFrame, parts);

    return (
      <svg viewBox="-1 -1 26 26" overflow="visible" className={className} aria-hidden="true">
        <defs>
          <mask id={cutId} maskUnits="userSpaceOnUse" x="-6" y="-6" width="36" height="36">
            <rect x="-6" y="-6" width="36" height="36" fill="#fff" />
            <g ref={cut}>
              <path d={PEN} fill="#000" stroke="#000" strokeWidth="4.1" strokeLinejoin="round" />
            </g>
          </mask>
          <mask id={inkCutId} maskUnits="userSpaceOnUse" x="-6" y="-6" width="36" height="36">
            <rect x="-6" y="-6" width="36" height="36" fill="#fff" />
            <g ref={inkCut}>
              <path d={PEN_BODY} fill="#000" stroke="#000" strokeWidth="2.6" strokeLinejoin="round" />
            </g>
          </mask>
        </defs>

        <g fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <g mask={`url(#${cutId})`}>
            <path d="M15.6 1.8H7.2L2.6 6.4v15.4c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V2.8c0-.55-.45-1-1-1z" />
            <path d="M2.6 6.4h3.6c.55 0 1-.45 1-1V1.8" />
          </g>

          <g ref={ink} mask={`url(#${inkCutId})`}>
            {LINES.map((line) => (
              <path key={line.y} d={`M${line.from} ${line.y}H${line.to}`} pathLength="1" strokeDasharray="1" strokeDashoffset="0" />
            ))}
          </g>

          <g ref={pen}>
            <path d={PEN} />
            <path d={PEN_BAND} />
          </g>
        </g>
      </svg>
    );
  }
