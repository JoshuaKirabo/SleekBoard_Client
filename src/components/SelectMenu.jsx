import { useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon, CheckIcon } from "./icons.jsx";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

// One row is h-9, the list has p-1.5 and hangs 6px off the trigger. Long lists stop growing at MENU_MAX and scroll.
const ROW = 36;
const MENU_PADDING = 12;
const MENU_GAP = 6;
const MENU_MAX = 264;

// The nearest ancestor that scrolls. A menu inside a scrolling popup has to fit in that, not just the window.
const scrollParent = (node) =>
  {
    for(let at = node?.parentElement; at; at = at.parentElement)
      {
        const { overflowY } = getComputedStyle(at);
        if(overflowY === "auto" || overflowY === "scroll") return at;
      }
    return null;
  };

// How much room there is above and below the trigger, inside whatever it scrolls in.
const roomAround = (node) =>
  {
    const box = node.getBoundingClientRect();
    const frame = scrollParent(node)?.getBoundingClientRect();
    const bottom = Math.min(window.innerHeight, frame ? frame.bottom : window.innerHeight);
    const top = Math.max(0, frame ? frame.top : 0);
    return { below: bottom - box.bottom, above: box.top - top };
  };

// The next option whose label starts with the typed letter, after the one under the cursor, wrapping round.
const findByLetter = (options, from, letter) =>
  {
    const wanted = letter.toLowerCase();
    for(let step = 1; step <= options.length; step++)
      {
        const at = (from + step) % options.length;
        if(options[at].label.toLowerCase().startsWith(wanted)) return at;
      }
    return from;
  };

// Our dropdown, used instead of the browser's <select> everywhere. The trigger shows the current option; the menu
// opens underneath it, or above when there isn't room below, and closes on pick, Escape, or a click anywhere else.
// Arrow keys walk the options, Home and End jump, a letter jumps to the next option starting with it, and focus goes
// back to the trigger when it closes so you never lose your place. Escape stops here, so a popup around it stays open.
//
// options: [{ value, label }]. An option whose value is "" is the "any" choice and shows dimmer in the trigger.
// trigger: the trigger's size, colour and hover classes, so each place can match the fields around it.
export default function SelectMenu({ value, options, onChange, label, trigger, block = true, labelTrigger = false })
  {
    const [open, setOpen] = useState(false);
    const [above, setAbove] = useState(false);
    const [cursor, setCursor] = useState(0);
    const root = useRef(null);
    const button = useRef(null);
    const list = useRef(null);
    const id = useId();
    const current = options.find((option) => option.value === value) || options[0];

    const close = (refocus = true) =>
      {
        setOpen(false);
        if(refocus) button.current?.focus();
      };

    const show = () =>
      {
        const height = Math.min(MENU_MAX, options.length * ROW + MENU_PADDING) + MENU_GAP;
        const room = roomAround(button.current);
        setAbove(room.below < height && room.above > room.below);
        setCursor(Math.max(0, options.indexOf(current)));
        setOpen(true);
      };

    const pick = (option) =>
      {
        if(option.value !== value) onChange(option.value);
        close();
      };

    // Focus follows the cursor inside the list, so screen readers announce the option under it.
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
        const last = options.length - 1;
        switch(event.key)
          {
            case "ArrowDown": event.preventDefault(); setCursor((at) => Math.min(last, at + 1)); break;
            case "ArrowUp": event.preventDefault(); setCursor((at) => Math.max(0, at - 1)); break;
            case "Home": event.preventDefault(); setCursor(0); break;
            case "End": event.preventDefault(); setCursor(last); break;
            case "Enter":
            case " ": event.preventDefault(); pick(options[cursor]); break;
            case "Escape": event.preventDefault(); event.stopPropagation(); close(); break;
            case "Tab": close(false); break;
            default:
              if(event.key.length === 1 && /\S/.test(event.key)) setCursor((at) => findByLetter(options, at, event.key));
              break;
          }
      };

    return (
      <div ref={root} className={`relative ${block ? "block" : "inline-block"}`}>
        <button
          ref={button}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-label={labelTrigger ? `${label}: ${current.label}` : undefined}
          data-open={open}
          onClick={() => (open ? close() : show())}
          onKeyDown={onTriggerKey}
          className={`flex cursor-pointer items-center justify-between gap-2 text-left transition-colors duration-150 ${focusRing} ${trigger}`}
        >
          <span className={`truncate ${current.value === "" ? "text-ink-2" : ""}`}>{current.label}</span>
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
          className={`lane-scroll absolute left-0 z-20 max-h-[264px] min-w-full overflow-y-auto rounded-[14px] bg-raised p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.3),0_18px_40px_-12px_rgba(0,0,0,0.65)] transition-[opacity,transform] ease-out-strong ${above ? "bottom-full mb-1.5 origin-bottom" : "top-full mt-1.5 origin-top"} ${open ? "scale-100 opacity-100 duration-150" : "pointer-events-none scale-[0.96] opacity-0 duration-[110ms]"}`}
        >
          {options.map((option, index) => {
            const selected = option === current;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={selected}
                tabIndex={open && index === cursor ? 0 : -1}
                onPointerEnter={() => setCursor(index)}
                onClick={() => pick(option)}
                className={`flex h-9 shrink-0 cursor-pointer items-center justify-between gap-6 rounded-[9px] px-3 text-[13px] whitespace-nowrap outline-none transition-colors duration-100 ${index === cursor ? "bg-surface text-ink" : "text-ink-2"} ${selected ? "font-medium text-ink" : ""}`}
              >
                {option.label}
                {selected && <CheckIcon size={13} className="text-cream" />}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
