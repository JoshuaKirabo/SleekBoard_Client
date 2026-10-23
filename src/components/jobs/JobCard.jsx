import { useId, useRef, useState, useEffect, useLayoutEffect } from "react";
import { shortDate, daysUntil } from "./statuses.js";
import { springTo, project, velocityFrom, prefersReducedMotion } from "./spring.js";
import CompanyMark from "./CompanyMark.jsx";
import { logoFor } from "./logos.js";
import useLogoTint from "./useLogoTint.js";
import { DRAWER_ID } from "./statuses.js";

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
// so letting go never pops. The press starts on the button; the rest of the drag is tracked on the window.
// A "still" card only opens. The Ghosted drawer's cards are still, since the drawer sits over the board and there's
// nowhere sensible to drag them to; their status changes from the panel.
export default function JobCard({ job, selected, fresh, still = false, onOpen, onMove, laneAt, onHover, landing })
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

    // Each lane scrolls, and a scrolling box clips whatever is inside it, so a lifted card would be cut off at its own
    // lane's edge. While it's in the air the card is pinned to the window over its slot instead, which no lane can
    // clip, and the slot keeps its height so the lane doesn't close up underneath. The translate carries on from the
    // slot either way, so the drag and the spring don't notice the switch.
    const float = () =>
      {
        const card = wrapper.current;
        if(card.style.position === "fixed") return;
        const box = card.getBoundingClientRect();
        card.parentElement.style.height = `${box.height}px`;
        card.style.position = "fixed";
        card.style.left = `${box.left - pos.current.x}px`;
        card.style.top = `${box.top - pos.current.y}px`;
        card.style.width = `${box.width}px`;
      };

    const ground = () =>
      {
        const card = wrapper.current;
        if(!card) return;
        card.style.position = card.style.left = card.style.top = card.style.width = "";
        card.parentElement.style.height = "";
      };

    const settle = (velocity) =>
      {
        const done = () =>
          {
            ground();
            setLifted(false);
          };
        if(prefersReducedMotion())
          {
            place(0, 0);
            done();
            return;
          }
        stopSpring.current = springTo({ from: pos.current, velocity, onFrame: place, onDone: done });
      };

    // Just landed in a new lane. Start from where the card was dropped and spring into its new slot. If the slot is
    // below the fold of a long lane, the lane scrolls to it first so the card has somewhere visible to land.
    useLayoutEffect(() =>
      {
        const land = landing?.current;
        if(!land || land.id !== job.id) return;
        landing.current = null;
        const slot = wrapper.current.parentElement.getBoundingClientRect();
        const list = wrapper.current.parentElement.parentElement;
        const view = list.getBoundingClientRect();
        if(slot.top < view.top) list.scrollTop -= view.top - slot.top;
        else if(slot.bottom > view.bottom) list.scrollTop += slot.bottom - view.bottom;
        const now = wrapper.current.getBoundingClientRect();
        float();
        place(land.rect.left - now.left, land.rect.top - now.top);
        setLifted(true);
        settle(land.velocity);
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);

    // The moves and the release are read off the window, not the card. Pointer capture alone isn't safe here: on
    // a quick release Chrome on macOS sees a mouse move with no button held a moment before the up, drops the
    // capture on that move, and hands the up to whatever card is under the cursor. The card never hears it and
    // stays lifted where it was let go. Window listeners get the up no matter who it lands on, and a buttonless
    // move while we think we're dragging is read as the release it really is.
    const listening = useRef(null);

    const stopListening = () =>
      {
        const bound = listening.current;
        if(!bound) return;
        listening.current = null;
        window.removeEventListener("pointermove", bound.move, true);
        window.removeEventListener("pointerup", bound.up, true);
        window.removeEventListener("pointercancel", bound.up, true);
      };

    useEffect(() => stopListening, []);

    const onPointerDown = (event) =>
      {
        // Touch keeps scrolling the board for now, status still moves from the panel.
        if(still || event.button !== 0 || event.pointerType === "touch") return;
        // Grabbing a card that's still springing picks it up from wherever it is right now.
        stopSpring.current?.();
        stopListening();
        dragged.current = false;
        // The lift scales around the spot you grabbed, so the card grows and shrinks under your finger, not its middle.
        const face = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.transformOrigin = `${event.clientX - face.left}px ${event.clientY - face.top}px`;
        drag.current = { pointerId: event.pointerId, downX: event.clientX, downY: event.clientY, grabX: event.clientX - pos.current.x, grabY: event.clientY - pos.current.y, active: false, samples: [{ t: event.timeStamp, x: event.clientX, y: event.clientY }] };
        // Capture is still asked for so the moves keep coming when the pointer leaves the browser window. Synthetic
        // events have no real pointer to capture, so that call is allowed to fail.
        try
          {
            event.currentTarget.setPointerCapture(event.pointerId);
          }
        catch
          {
            // nothing to do, the window listeners below carry the drag either way
          }
        const bound = { move: onPointerMove, up: onPointerUp };
        listening.current = bound;
        window.addEventListener("pointermove", bound.move, true);
        window.addEventListener("pointerup", bound.up, true);
        window.addEventListener("pointercancel", bound.up, true);
      };

    const onPointerMove = (event) =>
      {
        const state = drag.current;
        if(!state || event.pointerId !== state.pointerId) return;

        // The button came up and the browser told us with a move instead of an up. Treat it as the drop.
        if(event.buttons === 0)
          {
            onPointerUp(event);
            return;
          }

        if(!state.active)
          {
            if(Math.hypot(event.clientX - state.downX, event.clientY - state.downY) < DRAG_THRESHOLD) return;
            state.active = true;
            dragged.current = true;
            float();
            setLifted(true);
          }

        place(event.clientX - state.grabX, event.clientY - state.grabY);
        state.samples.push({ t: event.timeStamp, x: event.clientX, y: event.clientY });
        if(state.samples.length > 8) state.samples.shift();
        // Over the Ghosted chip the card shrinks down toward the pointer, as if tucked into it, and that uncovers the
        // chip so you can see it swell. See [data-tucking] in index.css.
        const lane = laneAt(event.clientX, event.clientY);
        wrapper.current.toggleAttribute("data-tucking", lane === DRAWER_ID);
        onHover(lane);
      };

    const onPointerUp = (event) =>
      {
        const state = drag.current;
        if(!state || event.pointerId !== state.pointerId) return;
        drag.current = null;
        stopListening();
        // A tap on a card that was still springing home stopped it mid-air. Let it finish the trip.
        if(!state.active)
          {
            if(pos.current.x || pos.current.y) settle({ x: 0, y: 0 });
            return;
          }
        onHover(null);
        wrapper.current.removeAttribute("data-tucking");

        // If you let go over another lane, that's the one you meant. If you let go still in the home lane or off the
        // board, aim where the flick was heading so a quick toss still carries the card over the border.
        const velocity = velocityFrom(state.samples);
        const here = laneAt(event.clientX, event.clientY);
        const flicked = Math.abs(velocity.x) > FLICK_SPEED;
        const ahead = flicked ? laneAt(event.clientX + project(velocity.x), event.clientY + project(velocity.y), true) : null;
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
          aria-pressed={selected}
          style={tint ? { "--tint": tint } : undefined}
          className={`job-card group w-full rounded-xl ${still ? "cursor-pointer" : "cursor-grab"} p-3.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream ${lifted ? "is-lifted scale-[1.03] cursor-grabbing bg-raised shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)]" : "active:scale-[0.985]"} ${selected ? "bg-raised" : "bg-surface"}`}
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
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-0.5 text-[11px] tabular-nums">
              <span className="card-meta text-ink-3">{job.applied ? `Applied ${shortDate(job.applied)}` : "Not applied"}</span>
              {deadline && <span className={urgent ? "card-urgent font-medium text-cream" : "card-meta text-ink-3"}>{deadline}</span>}
            </div>
          )}
        </button>
      </div>
    );
  }
