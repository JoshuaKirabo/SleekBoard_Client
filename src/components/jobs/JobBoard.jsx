import { useRef, useState, useEffect, useLayoutEffect } from "react";
import { BOARD_LANES, DRAWER_ID } from "./statuses.js";
import JobCard from "./JobCard.jsx";

// Which lane is under a point on screen. Measured from the lane boxes themselves instead of hit-testing the DOM,
// so the card being dragged never gets in the way of its own drop. The Ghosted chip in the toolbar is a drop target
// too, but only for a card let go right on it: a flick's projected landing never counts it, so a quick toss across
// the top row can't ghost something by accident.
const laneAt = (x, y, flick = false) =>
  {
    const lanes = document.querySelectorAll("[data-lane]");
    for(const lane of lanes)
      {
        if(flick && lane.dataset.lane === DRAWER_ID) continue;
        const box = lane.getBoundingClientRect();
        if(x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) return lane.dataset.lane;
      }
    return null;
  };

// Five lanes never split evenly into rows, so the narrower layouts give the leftovers the extra width instead of
// leaving a hole. On a six-track grid the first three take two tracks each and the last two take three; on the
// two-column phone grid the fifth lane runs the full width. Wide boards just put all five in a row.
const SPANS = [
  "@min-[480px]/board:col-span-2 @min-[760px]/board:col-span-1",
  "@min-[480px]/board:col-span-2 @min-[760px]/board:col-span-1",
  "@min-[480px]/board:col-span-2 @min-[760px]/board:col-span-1",
  "@min-[480px]/board:col-span-3 @min-[760px]/board:col-span-1",
  "col-span-2 @min-[480px]/board:col-span-3 @min-[760px]/board:col-span-1",
];

// A lane's card list, the part that scrolls. When there's more below than fits, a soft fade at the foot of the lane
// says so, and it lifts once you reach the end. Checked on scroll, on resize, and after every render, since a card
// added or moved changes the answer without the box itself changing size. The list reaches out to the lane's edges
// and pads back in, so a hovered card's glow has room on either side before the scroll box clips it.
function LaneScroll({ children })
  {
    const list = useRef(null);
    const [more, setMore] = useState(false);

    const check = () =>
      {
        const box = list.current;
        if(box) setMore(box.scrollHeight - box.scrollTop - box.clientHeight > 2);
      };

    useLayoutEffect(check);

    useEffect(() =>
      {
        const box = list.current;
        box.addEventListener("scroll", check, { passive: true });
        const watch = new ResizeObserver(check);
        watch.observe(box);
        return () =>
          {
            box.removeEventListener("scroll", check);
            watch.disconnect();
          };
      }, []);

    return (
      <div className="relative -mx-2 mt-1 flex min-h-0 flex-1 flex-col">
        <ul ref={list} className="lane-scroll flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-2 pt-2 pb-3">
          {children}
        </ul>
        <div aria-hidden="true" className={`pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-canvas to-transparent transition-opacity duration-200 ${more ? "opacity-100" : "opacity-0"}`} />
      </div>
    );
  }

// Lanes sit straight on the canvas, no tinted container around them. The cards are the only surfaces, and the thin rail
// under each lane title carries the status colour, so the row of rails reads as the pipeline left to right.
// Drag a card across and the lane it's over lights up. The landing ref hands the drop point to the card's new
// instance so it can spring into place from there.
//
// The whole pipeline is always on screen. The lanes are a grid that reflows on the board's own width, not the
// window's, so the sidebar is already accounted for: five across when there's room for a readable card, three over
// two on a small laptop or tablet, two-two-one on a phone. Rows share the height equally and a long lane scrolls
// inside itself. The board's negative margin cancels the lanes' padding, so the cards line up with the toolbar.
// Which lane a dragged card is over lives with the page, since the toolbar's Ghosted chip lights up from it too.
export default function JobBoard({ jobs, selectedId, onOpen, onMove, freshId, over, onHover })
  {
    const landing = useRef(null);

    // A card dropped on the Ghosted chip goes into the drawer, where there's no slot on screen to spring into.
    // Dropping the landing note stops it replaying later when the drawer opens and the card mounts there.
    const move = (id, lane) =>
      {
        if(lane === DRAWER_ID) landing.current = null;
        onMove(id, lane);
      };

    return (
      <div className="@container/board -mx-2 flex min-h-0 flex-1 flex-col">
        <div className="grid min-h-0 flex-1 grid-cols-2 auto-rows-[minmax(0,1fr)] gap-x-1 gap-y-3 @min-[480px]/board:grid-cols-6 @min-[760px]/board:grid-cols-5">
          {BOARD_LANES.map((status, index) => {
            const lane = jobs.filter((job) => job.status === status.id);
            const active = over === status.id;

            return (
              <section
                key={status.id}
                data-lane={status.id}
                aria-label={status.label}
                className={`@container/lane flex min-h-0 min-w-0 flex-col rounded-xl ${SPANS[index]} px-2 pt-2 transition-colors duration-150 ${active ? "bg-white/[0.035]" : ""}`}
              >
                {/* Small caps want a little air between the letters, so the tracking opens up as the size comes down.
                    The label sits a step below the cards in tone so the company names stay the loudest thing in the lane,
                    and the count hangs off it in the quietest grey. */}
                <header className="flex shrink-0 items-baseline gap-2 px-0.5 pb-3">
                  <h2 className="text-[11px] leading-none font-semibold tracking-[0.14em] text-ink-2 uppercase">{status.label}</h2>
                  <span className="text-[11px] leading-none text-ink-3 tabular-nums">{lane.length}</span>
                </header>
                {/* The rail is brightest under the label and fades out to the right, like light falling off, not a bar. */}
                <div className={`h-[2px] shrink-0 rounded-full transition-opacity duration-150 [mask-image:linear-gradient(to_right,black_0%,black_45%,transparent_100%)] ${status.rail} ${over && !active ? "opacity-50" : ""}`} aria-hidden="true" />

                <LaneScroll>
                  {lane.map((job) => (
                    <li key={job.id}>
                      <JobCard job={job} selected={job.id === selectedId} fresh={job.id === freshId} onOpen={onOpen} onMove={move} laneAt={laneAt} onHover={onHover} landing={landing} />
                    </li>
                  ))}
                  {lane.length === 0 && <li className={`rounded-xl px-3.5 py-5 text-center text-[12px] transition-colors duration-150 ${active ? "bg-raised text-ink-2" : "bg-surface/50 text-ink-3"}`}>{active ? "Drop it here" : status.empty}</li>}
                </LaneScroll>
              </section>
            );
          })}
        </div>
      </div>
    );
  }
