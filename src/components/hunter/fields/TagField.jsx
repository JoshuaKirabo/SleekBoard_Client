import { useEffect, useId, useRef, useState } from "react";
import { CloseIcon } from "../../icons.jsx";
import RoleMenu from "./RoleMenu.jsx";
import PlaceMenu from "./PlaceMenu.jsx";
import usePlaceSuggestions from "../usePlaceSuggestions.js";
import { focusRing, well } from "./styles.js";

// Your words, spelled the way the suggestion list spells them when they match one.
const tidy = (typed, suggestions) =>
  {
    const text = typed.trim().replace(/\s+/g, " ");
    return suggestions.find((option) => option.toLowerCase() === text.toLowerCase()) || text;
  };

const has = (values, text) => values.some((value) => value.toLowerCase() === text.toLowerCase());

// A list of free-text picks. Type and press Enter; Backspace in an empty box takes the last pick back off. The
// suggestion list only fixes spelling, so "java engineer" lands as "Java Engineer". With `menu`, clicking the box or
// typing in it opens the role picker under it; focus alone doesn't, so the popup can open with the box ready to type
// without a menu over everything. With `places`, typing offers places from anywhere in the world under the box, the
// way the Kisaka job application's Location does; arrows and Enter pick one. `big` makes it the popup's lead field.
export default function TagField({ label, values, onChange, suggestions = [], placeholder, big = false, menu = false, places = false, inputRef })
  {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(null);
    const box = useRef(null);
    const ownRef = useRef(null);
    const input = inputRef || ownRef;
    const listId = useId();

    // The highlight follows a place, not a row, so it stays put when Photon's places join the list.
    const found = usePlaceSuggestions(query, values, places && open);
    const showPlaces = places && open && found.length > 0;
    const active = found.findIndex((place) => place.value === highlighted);

    // A press anywhere outside the field closes the picker.
    useEffect(() =>
      {
        if(!open) return;
        const away = (event) => !box.current?.contains(event.target) && setOpen(false);
        document.addEventListener("pointerdown", away);
        return () => document.removeEventListener("pointerdown", away);
      }, [open]);

    const add = (text) =>
      {
        const clean = tidy(text, suggestions);
        if(clean && !has(values, clean)) onChange([...values, clean]);
        setQuery("");
        setHighlighted(null);
      };

    const pick = (place) =>
      {
        add(place.value);
        setOpen(false);
      };

    // Down from nothing lands on the first place, up on the last, and both wrap around.
    const step = (by) =>
      {
        const next = active === -1 ? (by > 0 ? 0 : found.length - 1) : (active + by + found.length) % found.length;
        setHighlighted(found[next].value);
      };

    const remove = (value) => onChange(values.filter((item) => item !== value));
    const toggle = (value) => (values.includes(value) ? remove(value) : onChange([...values, value]));

    const onKeyDown = (event) =>
      {
        if(showPlaces && (event.key === "ArrowDown" || event.key === "ArrowUp"))
          {
            event.preventDefault();
            step(event.key === "ArrowDown" ? 1 : -1);
          }
        else if(showPlaces && event.key === "Enter" && active > -1)
          {
            event.preventDefault();
            pick(found[active]);
          }
        else if(event.key === "Enter" || (event.key === "," && query.trim()))
          {
            event.preventDefault();
            if(query.trim()) add(query);
          }
        else if(event.key === "Backspace" && !query && values.length)
          {
            remove(values[values.length - 1]);
          }
      };

    // Escape anywhere in the field closes only the picker; the popup around it stays.
    const closeOnEscape = (event) =>
      {
        if(event.key !== "Escape" || !open) return;
        event.stopPropagation();
        setOpen(false);
        input.current?.focus();
      };

    // Focus leaving the field (box and picker together) keeps what you typed and closes the picker.
    const onLeave = (event) =>
      {
        if(box.current?.contains(event.relatedTarget)) return;
        if(query.trim()) add(query);
        setOpen(false);
      };

    const size = `min-h-12 px-2.5 py-2 ${big ? "text-[16px]" : "text-[14.5px]"}`;

    return (
      <div ref={box} onKeyDown={closeOnEscape} onBlur={onLeave} className="relative">
        {/* The whole well focuses the box, so a click between two picks still lands you in it. */}
        <div onClick={() => input.current?.focus()} className={`${well} ${size} flex cursor-text flex-wrap items-center gap-1.5 focus-within:bg-board-deep`}>
          {values.map((value) => (
            <span key={value} className="tag-pop flex h-8 items-center gap-1 rounded-full bg-cream/[0.1] pr-1 pl-3 text-[13.5px] font-medium text-cream">
              {value}
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={(event) => { event.stopPropagation(); remove(value); }} className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-cream/70 transition-colors duration-150 hover:bg-cream/15 hover:text-cream ${focusRing}`} aria-label={`Remove ${value}`}>
                <CloseIcon size={12} />
              </button>
            </span>
          ))}
          <input
            ref={input}
            value={query}
            onChange={(event) =>
              {
                setQuery(event.target.value);
                setHighlighted(null);
                if(menu || places) setOpen(true);
              }}
            onClick={() => menu && setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={values.length ? "" : placeholder}
            aria-label={label}
            aria-expanded={menu ? open : places ? showPlaces : undefined}
            role={places ? "combobox" : undefined}
            aria-autocomplete={places ? "list" : undefined}
            aria-controls={showPlaces ? listId : undefined}
            aria-activedescendant={showPlaces && active > -1 ? `${listId}-${active}` : undefined}
            className="h-8 min-w-[10ch] flex-1 bg-transparent px-1.5 text-ink placeholder:text-ink-3 focus:outline-none"
          />
        </div>

        {menu && open && <RoleMenu query={query} values={values} onToggle={toggle} />}
        {showPlaces && <PlaceMenu id={listId} places={found} active={active} onPoint={(index) => setHighlighted(found[index].value)} onPick={pick} />}
      </div>
    );
  }
