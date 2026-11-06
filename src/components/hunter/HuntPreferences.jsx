import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CloseIcon } from "../icons.jsx";
import { prefersReducedMotion } from "../jobs/spring.js";
import { EMPTY_HUNT } from "./huntOptions.js";
import HuntSections, { SECTIONS } from "./HuntSections.jsx";
import { focusRing } from "./fields/styles.js";

// Each item in the left-hand list is this tall, so the highlight behind the active one can slide by whole steps.
const NAV_ITEM_PX = 48;
// A section counts as the one you're reading once its title is above this share of the scroll area's height.
const READING_LINE = 0.4;
// How long the popup takes to shrink back into the roles box before it's put away (index.css, .hunt-panel).
const LEAVE_MS = 340;
// The roles field has settled in by about this point. Focusing it sooner would put the focus ring on something
// still sliding into place.
const FOCUS_AFTER_MS = 420;

// Why Start hunting can't be pressed yet, in words, or nothing when it can.
const whatsMissing = (hunt) =>
  {
    if(!hunt.roles.length && !hunt.posted) return "Add a job function and pick a date posted";
    if(!hunt.roles.length) return "Add at least one job function";
    if(!hunt.posted) return "Pick a date posted";
    return "";
  };

// The section whose title has scrolled up past the reading line, or the last one once you hit the bottom.
const sectionInView = (scroller) =>
  {
    const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 4;
    if(atBottom) return SECTIONS[SECTIONS.length - 1].id;
    const passed = [...scroller.querySelectorAll("[data-section]")].filter((section) => section.offsetTop - scroller.scrollTop <= scroller.clientHeight * READING_LINE);
    return passed.length ? passed[passed.length - 1].dataset.section : SECTIONS[0].id;
  };

// Keeps the page behind from scrolling while the popup is up, and gives focus back to whatever opened it on close.
function usePageHeldBehind(open)
  {
    useEffect(() =>
      {
        if(!open) return;
        const opener = document.activeElement;
        const root = document.documentElement;
        const before = root.style.overflow;
        root.style.overflow = "hidden";
        return () =>
          {
            root.style.overflow = before;
            opener?.focus?.();
          };
      }, [open]);
  }

// Lays the popup's outline over the box it grows out of, as insets from the popup's own edges (index.css reads
// them as --from-*). Without a box the insets come off and the CSS closes toward the middle instead.
function pinOutlineTo(panel, box)
  {
    const sides = ["top", "right", "bottom", "left"];
    if(!box)
      {
        sides.forEach((side) => panel.style.removeProperty(`--from-${side}`));
        return;
      }

    const outer = panel.getBoundingClientRect();
    const inner = box.getBoundingClientRect();
    const insets = { top: inner.top - outer.top, right: outer.right - inner.right, bottom: outer.bottom - inner.bottom, left: inner.left - outer.left };
    sides.forEach((side) => panel.style.setProperty(`--from-${side}`, `${insets[side]}px`));
  }

// Keeps the popup's outline on the roles box, measured fresh each time, since the page may have scrolled and saving
// may have changed the box's size. A fresh open has to start from where the box is now, so it puts the panel back
// at rest for one forced style pass with the new measurements before letting it open.
function useGrowFromBox(state, panel, box)
  {
    const previous = useRef(state);

    useLayoutEffect(() =>
      {
        const from = previous.current;
        previous.current = state;
        const node = panel.current;
        if(!node || state === "rest") return;
        pinOutlineTo(node, box?.current);
        if(state !== "open" || from !== "rest") return;
        node.dataset.state = "rest";
        node.getBoundingClientRect();
        node.dataset.state = "open";
      }, [state, panel, box]);
  }

// Where the popup is in its motion: "open", "leaving" for the short exit after a close, or "rest" once it's hidden
// and pinned back over the roles box. Leaving only follows an open, so the first load starts at rest.
// The switch to leaving happens during the render that closes it, not in an effect after: one painted frame at rest
// would snap the panel out of sight before the exit could start.
function usePanelState(open)
  {
    const [wasOpen, setWasOpen] = useState(open);
    const [leaving, setLeaving] = useState(false);

    if(open !== wasOpen)
      {
        setWasOpen(open);
        setLeaving(!open);
      }

    useEffect(() =>
      {
        if(!leaving) return;
        const timer = setTimeout(() => setLeaving(false), LEAVE_MS);
        return () => clearTimeout(timer);
      }, [leaving]);

    if(open) return "open";
    return leaving ? "leaving" : "rest";
  }

// The section list down the left. A highlight slides behind the one you're reading; clicking one scrolls to it.
function SectionNav({ hunt, active, onPick, rise })
  {
    const index = Math.max(0, SECTIONS.findIndex((section) => section.id === active));

    return (
      <nav className={`${rise} relative hidden w-[300px] shrink-0 px-4 lg:block`} style={{ "--i": 1 }} aria-label="Sections">
        <span className="absolute inset-x-4 top-0 rounded-2xl bg-raised transition-[translate] duration-300 ease-in-out-strong" style={{ height: NAV_ITEM_PX, translate: `0 ${index * NAV_ITEM_PX}px` }} aria-hidden="true" />
        {SECTIONS.map((section) =>
          {
            const count = section.count(hunt);
            const on = section.id === active;
            return (
              <button key={section.id} type="button" onClick={() => onPick(section.id)} aria-current={on ? "true" : undefined} className={`relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 text-left transition-colors duration-150 ${on ? "text-ink" : "text-ink-2 hover:text-ink"} ${focusRing}`} style={{ height: NAV_ITEM_PX }}>
                <span className="min-w-0 truncate text-[14.5px] font-semibold">{section.title}</span>
                {count > 0 && <span key={count} className="tag-pop text-[13px] font-semibold text-cream tabular-nums">{count}</span>}
              </button>
            );
          })}
      </nav>
    );
  }

// The big popup that holds everything the hunter needs to know. It works on a copy: Cancel or Escape drops your
// changes, and only the main button hands them back. Opening and closing ride CSS transitions rather than keyframes,
// so closing it mid-open turns it straight around instead of finishing the open first. The motion itself lives in
// index.css under .hunt-panel and .hunt-backdrop: it grows out of the roles box (origin) and shrinks back into it.
export default function HuntPreferences({ open, hunt, firstTime, onClose, onSave, origin })
  {
    const [draft, setDraft] = useState(hunt);
    const [session, setSession] = useState(0);
    const [active, setActive] = useState(SECTIONS[0].id);
    const scroller = useRef(null);
    const rolesInput = useRef(null);

    usePageHeldBehind(open);
    const panel = useRef(null);
    const panelState = usePanelState(open);
    useGrowFromBox(panelState, panel, origin);

    // A fresh copy and a fresh scroll each time it opens. The session number remounts the fields, so folds and
    // half-typed words from last time don't carry over.
    useEffect(() =>
      {
        if(!open) return;
        setDraft(hunt);
        setSession((count) => count + 1);
        setActive(SECTIONS[0].id);
        if(scroller.current) scroller.current.scrollTop = 0;
        const timer = setTimeout(() => rolesInput.current?.focus(), FOCUS_AFTER_MS);
        const onKey = (event) => event.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () =>
          {
            clearTimeout(timer);
            window.removeEventListener("keydown", onKey);
          };
      }, [open, hunt, onClose]);

    const set = (key) => (value) => setDraft((current) => ({ ...current, [key]: value }));

    const goTo = (id) =>
      {
        const section = scroller.current?.querySelector(`[data-section="${id}"]`);
        if(!section) return;
        setActive(id);
        scroller.current.scrollTo({ top: section.offsetTop - 24, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      };

    const total = SECTIONS.reduce((sum, section) => sum + section.count(draft), 0);
    const missing = whatsMissing(draft);
    // The rise is a one-shot animation, so the class comes off on close and goes back on to replay it each open.
    const rise = open ? "rise" : "";

    return (
      <div inert={!open} className={`fixed inset-0 z-40 flex items-end justify-center sm:items-center sm:p-6 ${open ? "" : "pointer-events-none"}`}>
        <div onClick={onClose} data-state={panelState} className="hunt-backdrop absolute inset-0" aria-hidden="true" />

        <div
          ref={panel}
          role="dialog"
          aria-modal="true"
          aria-labelledby="hunt-prefs-title"
          data-state={panelState}
          className="hunt-panel relative flex h-[94dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-surface shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] sm:h-[min(820px,100%)] sm:max-w-[1080px] sm:rounded-[28px]"
        >
          <header className={`${rise} flex items-center justify-between px-7 pt-6 pb-5`} style={{ "--i": 0 }}>
            <h2 id="hunt-prefs-title" className="text-[26px] leading-none font-bold tracking-[-0.02em]">What should I hunt for?</h2>
            <button type="button" onClick={onClose} className={`-mr-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink-2 transition-[color,rotate,scale] duration-300 ease-out-strong hover:scale-110 hover:rotate-90 hover:text-ink active:scale-90 active:duration-100 ${focusRing}`} aria-label="Close">
              <CloseIcon size={16} />
            </button>
          </header>

          <div className="flex min-h-0 flex-1">
            <SectionNav hunt={draft} active={active} onPick={goTo} rise={rise} />

            <div ref={scroller} onScroll={(event) => setActive(sectionInView(event.currentTarget))} className="lane-scroll hunt-scroll relative min-w-0 flex-1 overflow-y-auto px-7 pt-4 lg:pl-10">
              <div key={session} className="mx-auto max-w-[640px] pb-10 lg:mx-0 lg:max-w-none">
                <HuntSections hunt={draft} set={set} rolesInput={rolesInput} />
              </div>
            </div>
          </div>

          {/* The scroll area fades out above the footer, so there's no line across the popup. The footer rises last,
              so the buttons never show before the title. */}
          <footer className={`${rise} relative flex flex-wrap items-center justify-between gap-3 px-7 py-4`} style={{ "--i": 3 }}>
            <div className="flex items-center gap-3 text-[13.5px]">
              <span className="text-ink-3 tabular-nums">{total ? `${total} picked` : "Nothing picked yet"}</span>
              {total > 0 && (
                <button type="button" onClick={() => setDraft(EMPTY_HUNT)} className={`cursor-pointer rounded-md font-medium text-ink-2 underline-offset-4 transition-colors duration-150 hover:text-ink hover:underline ${focusRing}`}>
                  Clear all
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className={`h-11 cursor-pointer rounded-full px-4 text-[13.5px] font-medium text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink ${focusRing}`}>
                Cancel
              </button>
              <button type="button" disabled={Boolean(missing)} onClick={() => onSave(draft)} title={missing || undefined} className={`h-11 cursor-pointer rounded-full bg-cream px-5 text-[14px] font-semibold text-canvas transition-[background-color,opacity,scale] duration-150 ease-out-strong hover:bg-ink active:scale-[0.97] disabled:cursor-default disabled:bg-raised disabled:text-ink-3 disabled:hover:bg-raised disabled:active:scale-100 ${focusRing}`}>
                {firstTime ? "Start hunting" : "Save"}
              </button>
            </div>
          </footer>
        </div>
      </div>
    );
  }
