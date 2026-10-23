import { useEffect, useId, useRef, useState } from "react";
import { STATUSES, statusById } from "./statuses.js";
import { ChevronDownIcon, CheckIcon } from "../icons.jsx";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

// Two faces for the same control. "well" is the form input in Add Job, a filled well like the text fields beside it.
// "pill" is the inline control on the detail panel, where it sits in a row rather than in a form.
const LOOKS = {
  well: `h-10 w-full rounded-xl bg-canvas px-3.5 text-[13px] text-ink hover:bg-board-deep data-[open=true]:bg-board-deep`,
  pill: `h-9 rounded-full bg-raised/70 pr-2.5 pl-3.5 text-[13px] font-medium text-ink hover:bg-raised data-[open=true]:bg-raised`,
};

// Roughly what six rows plus padding come to. Used to decide whether the menu drops or rises.
const MENU_HEIGHT = 248;

// A listbox for the six lanes. The trigger shows the current lane; the menu opens underneath it, or above when
// the bottom of the window is too close, and closes on pick, Escape, or a click anywhere else. Arrow keys walk
// the lanes, Home and End jump, and focus goes back to the trigger when it closes so you never lose your place.
export default function StatusSelect({ value, onChange, look = "well", label = "Status" })
  {
    const [open, setOpen] = useState(false);
    const [above, setAbove] = useState(false);
    const [cursor, setCursor] = useState(0);
    const root = useRef(null);
    const trigger = useRef(null);
    const list = useRef(null);
    const id = useId();
    const current = statusById(value) || STATUSES[0];

    const close = (refocus = true) =>
      {
        setOpen(false);
        if(refocus) trigger.current?.focus();
      };

    const show = () =>
      {
        const box = trigger.current?.getBoundingClientRect();
        setAbove(Boolean(box) && window.innerHeight - box.bottom < MENU_HEIGHT && box.top > MENU_HEIGHT);
        setCursor(Math.max(0, STATUSES.findIndex((status) => status.id === current.id)));
        setOpen(true);
      };

    const pick = (status) =>
      {
        if(status.id !== value) onChange(status.id);
        close();
      };

    // Focus follows the cursor inside the list, so screen readers announce the lane under it.
    useEffect(() =>
      {
        if(!open) return;
        list.current?.children[cursor]?.focus();
      }, [open, cursor]);

    useEffect(() =>
      {
        if(!open) return;
        const onDown = (event) =>
          {
            if(!root.current?.contains(event.target)) close(false);
          };
        document.addEventListener("pointerdown", onDown);
        return () => document.removeEventListener("pointerdown", onDown);
      }, [open]);

    const onTriggerKey = (event) =>
      {
        if(event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === " " || event.key === "Enter")
          {
            event.preventDefault();
            show();
          }
      };

    const onListKey = (event) =>
      {
        const last = STATUSES.length - 1;
        switch(event.key)
          {
            case "ArrowDown": event.preventDefault(); setCursor((at) => Math.min(last, at + 1)); break;
            case "ArrowUp": event.preventDefault(); setCursor((at) => Math.max(0, at - 1)); break;
            case "Home": event.preventDefault(); setCursor(0); break;
            case "End": event.preventDefault(); setCursor(last); break;
            case "Enter":
            case " ": event.preventDefault(); pick(STATUSES[cursor]); break;
            case "Escape": event.preventDefault(); close(); break;
            case "Tab": close(false); break;
            default: break;
          }
      };

    return (
      <div ref={root} className={`relative ${look === "well" ? "block" : "inline-block"}`}>
        <button
          ref={trigger}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-label={look === "pill" ? label : undefined}
          data-open={open}
          onClick={() => (open ? close() : show())}
          onKeyDown={onTriggerKey}
          className={`flex cursor-pointer items-center justify-between gap-2 transition-colors duration-150 ${focusRing} ${LOOKS[look]}`}
        >
          <span className="truncate">{current.label}</span>
          <ChevronDownIcon size={14} className={`shrink-0 text-ink-3 transition-transform duration-200 ease-out-strong ${open ? "rotate-180" : ""}`} />
        </button>

        {/* Scales from the edge it hangs off, so it reads as unfolding out of the trigger. Exits faster than it enters. */}
        <ul
          ref={list}
          id={`${id}-list`}
          role="listbox"
          aria-label={label}
          tabIndex={-1}
          onKeyDown={onListKey}
          className={`absolute left-0 z-20 min-w-full rounded-[14px] bg-raised p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.3),0_18px_40px_-12px_rgba(0,0,0,0.65)] transition-[opacity,transform] ease-out-strong ${above ? "bottom-full mb-1.5 origin-bottom" : "top-full mt-1.5 origin-top"} ${open ? "scale-100 opacity-100 duration-150" : "pointer-events-none scale-[0.96] opacity-0 duration-[110ms]"}`}
        >
          {STATUSES.map((status, index) => {
            const selected = status.id === current.id;
            return (
              <li
                key={status.id}
                role="option"
                aria-selected={selected}
                tabIndex={open && index === cursor ? 0 : -1}
                onPointerEnter={() => setCursor(index)}
                onClick={() => pick(status)}
                className={`flex h-9 cursor-pointer items-center justify-between gap-6 rounded-[9px] px-3 text-[13px] whitespace-nowrap outline-none transition-colors duration-100 ${index === cursor ? "bg-surface text-ink" : "text-ink-2"} ${selected ? "font-medium text-ink" : ""}`}
              >
                {status.label}
                {selected && <CheckIcon size={13} className="text-cream" />}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
