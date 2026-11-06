import { useRef, useState } from "react";
import { CloseIcon } from "../../icons.jsx";
import { focusRing, well } from "./styles.js";

// Your words, spelled the way the suggestion list spells them when they match one.
const tidy = (typed, suggestions) =>
  {
    const text = typed.trim().replace(/\s+/g, " ");
    return suggestions.find((option) => option.toLowerCase() === text.toLowerCase()) || text;
  };

const has = (values, text) => values.some((value) => value.toLowerCase() === text.toLowerCase());

// A list of free-text picks. Type and press Enter; Backspace in an empty box takes the last pick back off. The
// suggestion list isn't shown, it only fixes spelling, so "java engineer" lands as "Java Engineer". `big` makes it
// the popup's lead field.
export default function TagField({ label, values, onChange, suggestions = [], placeholder, big = false, inputRef })
  {
    const [query, setQuery] = useState("");
    const ownRef = useRef(null);
    const input = inputRef || ownRef;

    const add = (text) =>
      {
        const clean = tidy(text, suggestions);
        if(clean && !has(values, clean)) onChange([...values, clean]);
        setQuery("");
      };

    const remove = (value) => onChange(values.filter((item) => item !== value));

    const onKeyDown = (event) =>
      {
        if(event.key === "Enter" || (event.key === "," && query.trim()))
          {
            event.preventDefault();
            if(query.trim()) add(query);
          }
        else if(event.key === "Backspace" && !query && values.length)
          {
            remove(values[values.length - 1]);
          }
      };

    const size = big ? "min-h-14 px-3 py-2.5 text-[16px]" : "min-h-12 px-2.5 py-2 text-[14.5px]";

    return (
      <div>
        {/* The whole well focuses the box, so a click between two picks still lands you in it. */}
        <div onClick={() => input.current?.focus()} className={`${well} ${size} flex cursor-text flex-wrap items-center gap-1.5 focus-within:bg-board-deep`}>
          {values.map((value) => (
            <span key={value} className="tag-pop flex h-8 items-center gap-1 rounded-full bg-cream/[0.1] pr-1 pl-3 text-[13.5px] font-medium text-cream">
              {value}
              <button type="button" onClick={(event) => { event.stopPropagation(); remove(value); }} className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-cream/70 transition-colors duration-150 hover:bg-cream/15 hover:text-cream ${focusRing}`} aria-label={`Remove ${value}`}>
                <CloseIcon size={12} />
              </button>
            </span>
          ))}
          <input
            ref={input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            onBlur={() => query.trim() && add(query)}
            placeholder={values.length ? "" : placeholder}
            aria-label={label}
            className="h-8 min-w-[10ch] flex-1 bg-transparent px-1.5 text-ink placeholder:text-ink-3/70 focus:outline-none"
          />
        </div>
      </div>
    );
  }
