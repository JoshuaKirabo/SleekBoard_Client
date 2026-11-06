import { useEffect, useRef, useState } from "react";
import { CloseIcon } from "../icons.jsx";
import { prefersReducedMotion } from "../jobs/spring.js";
import { EMPTY_HUNT } from "./huntOptions.js";
import HuntSections, { SECTIONS } from "./HuntSections.jsx";
import { focusRing } from "./fields/styles.js";

// Each item in the left-hand list is this tall, so the highlight behind the active one can slide by whole steps.
const NAV_ITEM_PX = 64;
// A section counts as the one you're reading once its title is within this far of the top of the scroll area.
const READING_LINE_PX = 120;

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
    const passed = [...scroller.querySelectorAll("[data-section]")].filter((section) => section.offsetTop - scroller.scrollTop <= READING_LINE_PX);
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
              <button key={section.id} type="button" onClick={() => onPick(section.id)} aria-current={on ? "true" : undefined} className={`relative flex w-full cursor-pointer items-center justify-between gap-3 rounded-2xl px-4 text-left transition-colors duration-150 ${on ? "text-ink" : "text-ink-2 hover:text-ink"} ${focusRing}`} style={{ height: NAV_ITEM_PX }}>
                <span className="min-w-0">
                  <span className="block truncate text-[14.5px] font-semibold">{section.title}</span>
                  <span className="block truncate text-[12.5px] text-ink-3">{section.hint}</span>
                </span>
                {count > 0 && <span key={count} className="tag-pop text-[13px] font-semibold text-cream tabular-nums">{count}</span>}
              </button>
            );
          })}
      </nav>
    );
  }

// The big popup that holds everything the hunter needs to know. It works on a copy: Cancel or Escape drops your
// changes, and only the main button hands them back. Opening and closing ride CSS transitions rather than keyframes,
// so closing it mid-open turns it straight around instead of finishing the open first.
export default function HuntPreferences({ open, hunt, firstTime, onClose, onSave })
  {
    const [draft, setDraft] = useState(hunt);
    const [session, setSession] = useState(0);
    const [active, setActive] = useState(SECTIONS[0].id);
    const scroller = useRef(null);
    const rolesInput = useRef(null);

    usePageHeldBehind(open);

    // A fresh copy and a fresh scroll each time it opens. The session number remounts the fields, so folds and
    // half-typed words from last time don't carry over.
    useEffect(() =>
      {
        if(!open) return;
        setDraft(hunt);
        setSession((count) => count + 1);
        setActive(SECTIONS[0].id);
        if(scroller.current) scroller.current.scrollTop = 0;
        // Wait for the rise so the focus ring doesn't flash on the way up.
        const timer = setTimeout(() => rolesInput.current?.focus(), 160);
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
        <div onClick={onClose} className={`absolute inset-0 bg-black/60 transition-opacity ease-out-strong ${open ? "opacity-100 duration-300" : "opacity-0 duration-200"}`} aria-hidden="true" />

        {/* Tailwind v4 keeps translate and scale on their own CSS properties, so those are what get transitioned. */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="hunt-prefs-title"
          className={`relative flex h-[94dvh] w-full flex-col overflow-hidden rounded-t-[28px] bg-surface shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] transition-[translate,scale,opacity] ease-out-strong sm:h-[min(820px,100%)] sm:max-w-[1080px] sm:rounded-[28px] ${open ? "translate-y-0 scale-100 opacity-100 duration-[420ms]" : "translate-y-6 scale-[0.97] opacity-0 duration-[260ms]"}`}
        >
          <header className={`${rise} flex items-center justify-between px-7 pt-6 pb-5`} style={{ "--i": 0 }}>
            <h2 id="hunt-prefs-title" className="text-[26px] leading-none font-bold tracking-[-0.02em]">What should I hunt for?</h2>
            <button type="button" onClick={onClose} className={`-mr-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink-2 transition-[color,rotate,scale] duration-300 ease-out-strong hover:scale-110 hover:rotate-90 hover:text-ink active:scale-90 active:duration-100 ${focusRing}`} aria-label="Close">
              <CloseIcon size={16} />
            </button>
          </header>

          <div className="flex min-h-0 flex-1">
            <SectionNav hunt={draft} active={active} onPick={goTo} rise={rise} />

            <div ref={scroller} onScroll={(event) => setActive(sectionInView(event.currentTarget))} className="lane-scroll relative min-w-0 flex-1 overflow-y-auto px-7 pt-1 lg:pr-10 lg:pl-4">
              <div key={session} className="mx-auto max-w-[640px] pb-10">
                <HuntSections hunt={draft} set={set} rolesInput={rolesInput} />
              </div>
            </div>
          </div>

          {/* The fade above the footer says there's more underneath without drawing a line across the popup. */}
          <footer className="relative flex flex-wrap items-center justify-between gap-3 px-7 py-4">
            <span className="pointer-events-none absolute inset-x-0 -top-10 h-10 bg-gradient-to-t from-surface to-transparent" aria-hidden="true" />
            <div className="flex items-center gap-3 text-[13.5px]">
              <span className="text-ink-2 tabular-nums">{total ? `${total} picked` : "Nothing picked yet"}</span>
              {total > 0 && (
                <button type="button" onClick={() => setDraft(EMPTY_HUNT)} className={`cursor-pointer rounded-md font-medium text-ink-2 underline-offset-4 transition-colors duration-150 hover:text-ink hover:underline ${focusRing}`}>
                  Clear all
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {missing && <span className="hidden text-[13px] text-ink-3 md:inline">{missing}</span>}
              <button type="button" onClick={onClose} className={`h-11 cursor-pointer rounded-full px-4 text-[13.5px] font-medium text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink ${focusRing}`}>
                Cancel
              </button>
              <button type="button" disabled={Boolean(missing)} onClick={() => onSave(draft)} title={missing || undefined} className={`h-11 cursor-pointer rounded-full bg-cream px-5 text-[14px] font-semibold text-canvas transition-[background-color,opacity,scale] duration-150 ease-out-strong hover:bg-ink active:scale-[0.97] disabled:cursor-default disabled:opacity-40 disabled:hover:bg-cream disabled:active:scale-100 ${focusRing}`}>
                {firstTime ? "Start hunting" : "Save"}
              </button>
            </div>
          </footer>
        </div>
      </div>
    );
  }
