import { useId, useRef, useState, useLayoutEffect } from "react";
import { shortDate, daysUntil } from "./statuses.js";
import { springTo, project, velocityFrom, prefersReducedMotion } from "./spring.js";
import CompanyMark from "./CompanyMark.jsx";
import { logoFor } from "./logos.js";
import useLogoTint from "./useLogoTint.js";

// Deadline reads as how many days are left, since that's what you actually act on. Past ones just show the date.
const deadlineLabel = (iso) =>
  {
    const days = daysUntil(iso);
    if(days === null) return "";
    if(days < 0) return `Closed ${shortDate(iso)}`;
    if(days === 0) return "Due today";
    if(days === 1) return "Due tomorrow";
    return `${days} days left`;
  };

// How far the pointer has to travel before a press turns into a drag. Under that it's a tap and opens the panel.
const DRAG_THRESHOLD = 8;

// Sideways speed, in px per second, that counts as a toss toward the next lane rather than a slow let-go.
const FLICK_SPEED = 700;

// One application. Tap it to open the panel, or drag it into another lane. The outer wrapper carries the live
// translate while you drag, the button underneath carries the lift (scale and shadow) through a CSS transition,
// so letting go never pops.
export default function JobCard({ job, selected, fresh, onOpen, onMove, laneAt, onHover, landing })
  {
    const wrapper = useRef(null);
    const drag = useRef(null);
    const pos = useRef({ x: 0, y: 0 });
    const stopSpring = useRef(null);
    const dragged = useRef(false);
    const [lifted, setLifted] = useState(false);
    const tint = useLogoTint(logoFor(job));
    // Each card's edge stroke has its own gradient, so the id has to be unique on the page.
    const edgeId = `edge-${useId().replace(/:/g, "")}`;

    const deadline = deadlineLabel(job.deadline);
    const days = daysUntil(job.deadline);
    const urgent = days !== null && days >= 0 && days <= 3;

    const place = (x, y) =>
      {
        pos.current = { x, y };
        wrapper.current.style.transform = x || y ? `translate(${x}px, ${y}px)` : "";
      };

    const settle = (velocity) =>
      {
        if(prefersReducedMotion())
          {
            place(0, 0);
            setLifted(false);
            return;
          }
        stopSpring.current = springTo({ from: pos.current, velocity, onFrame: place, onDone: () => setLifted(false) });
      };

    // Just landed in a new lane. Start from where the card was dropped and spring into its new slot.
    useLayoutEffect(() =>
      {
        const land = landing?.current;
        if(!land || land.id !== job.id) return;
        landing.current = null;
        const now = wrapper.current.getBoundingClientRect();
        place(land.rect.left - now.left, land.rect.top - now.top);
        setLifted(true);
        settle(land.velocity);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

    const onPointerDown = (event) =>
      {
        // Touch keeps scrolling the board for now, status still moves from the panel.
        if(event.button !== 0 || event.pointerType === "touch") return;
        // Grabbing a card that's still springing picks it up from wherever it is right now.
        stopSpring.current?.();
        dragged.current = false;
        drag.current = { downX: event.clientX, downY: event.clientY, grabX: event.clientX - pos.current.x, grabY: event.clientY - pos.current.y, active: false, samples: [{ t: event.timeStamp, x: event.clientX, y: event.clientY }] };
        // Capture keeps the moves coming even when the pointer leaves the card. Synthetic events have no real
        // pointer to capture, so that call is allowed to fail.
        try
          {
            event.currentTarget.setPointerCapture(event.pointerId);
          }
        catch
          {
            // nothing to do, the move events still reach us while the pointer is over the card
          }
      };

    const onPointerMove = (event) =>
      {
        const state = drag.current;
        if(!state) return;

        if(!state.active)
          {
            if(Math.hypot(event.clientX - state.downX, event.clientY - state.downY) < DRAG_THRESHOLD) return;
            state.active = true;
            dragged.current = true;
            setLifted(true);
          }

        place(event.clientX - state.grabX, event.clientY - state.grabY);
        state.samples.push({ t: event.timeStamp, x: event.clientX, y: event.clientY });
        if(state.samples.length > 8) state.samples.shift();
        onHover(laneAt(event.clientX, event.clientY));
      };

    const onPointerUp = (event) =>
      {
        const state = drag.current;
        drag.current = null;
        if(!state || !state.active) return;
        onHover(null);

        // If you let go over another lane, that's the one you meant. If you let go still in the home lane or off the
        // board, aim where the flick was heading so a quick toss still carries the card over the border.
        const velocity = velocityFrom(state.samples);
        const here = laneAt(event.clientX, event.clientY);
        const flicked = Math.abs(velocity.x) > FLICK_SPEED;
        const ahead = flicked ? laneAt(event.clientX + project(velocity.x), event.clientY + project(velocity.y)) : null;
        const target = here && here !== job.status ? here : ahead || here;

        if(target && target !== job.status)
          {
            landing.current = { id: job.id, rect: wrapper.current.getBoundingClientRect(), velocity };
            onMove(job.id, target);
            return;
          }

        settle(velocity);
      };

    const onClick = () =>
      {
        if(dragged.current) return;
        onOpen(job.id);
      };

    return (
      <div ref={wrapper} className={`relative ${fresh ? "card-rise" : ""} ${lifted ? "z-20 pointer-events-none" : ""}`}>
        <button
          type="button"
          onClick={onClick}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-pressed={selected}
          style={tint ? { "--tint": tint } : undefined}
          className={`job-card group w-full cursor-grab rounded-xl p-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream ${lifted ? "is-lifted scale-[1.03] cursor-grabbing bg-raised shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)]" : "active:scale-[0.985]"} ${selected ? "bg-raised" : "bg-surface"}`}
        >
          {/* The edge stroke. Drawn by CSS on hover, see .job-card-edge. Brightest at the bottom where it starts. */}
          <svg className="job-card-edge" aria-hidden="true">
            <defs>
              <linearGradient id={edgeId} x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" style={{ stopColor: "rgb(var(--tint))" }} stopOpacity="0.92" />
                <stop offset="42%" style={{ stopColor: "rgb(var(--tint))" }} stopOpacity="0.72" />
                <stop offset="100%" style={{ stopColor: "rgb(var(--tint))" }} stopOpacity="0.48" />
              </linearGradient>
            </defs>
            <g>
              <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="11" ry="11" fill="none" stroke={`url(#${edgeId})`} strokeWidth="1.5" vectorEffect="non-scaling-stroke" pathLength="1" strokeLinecap="round" />
            </g>
          </svg>

          <div className="flex items-center gap-2.5">
            <CompanyMark job={job} />
            <span className={`truncate text-[13px] font-semibold transition-colors duration-150 ${selected ? "text-cream" : ""}`}>{job.company}</span>
          </div>

          {/* The small grey lines are "card-meta": on hover they turn a pale version of the brand colour rather than
              staying grey against it, see .card-meta in index.css. The role stays white. */}
          <p className="mt-2.5 text-[13px] leading-snug text-ink">{job.role}</p>
          <p className="card-meta mt-1 text-[12px] text-ink-3">{job.location}</p>

          {(job.applied || deadline) && (
            <div className="mt-3 flex items-center justify-between gap-2 text-[11px] tabular-nums">
              <span className="card-meta text-ink-3">{job.applied ? `Applied ${shortDate(job.applied)}` : "Not applied"}</span>
              {deadline && <span className={urgent ? "card-urgent font-medium text-cream" : "card-meta text-ink-3"}>{deadline}</span>}
            </div>
          )}
        </button>
      </div>
    );
  }
