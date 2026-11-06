import { CheckIcon } from "../../icons.jsx";
import { focusRing } from "./styles.js";

const flip = (values, option) => (values.includes(option) ? values.filter((value) => value !== option) : [...values, option]);

// A set of tiles you can turn on and off, any number at once. Each one is a toggle button, so a screen reader hears
// "pressed" or "not pressed" rather than a checkbox it can't find a form for.
export default function ChoiceTiles({ options, values, onChange, columns = "sm:grid-cols-2" })
  {
    return (
      <div className={`grid gap-2 ${columns}`}>
        {options.map((option) =>
          {
            const on = values.includes(option);
            return (
              <button
                key={option}
                type="button"
                aria-pressed={on}
                onClick={() => onChange(flip(values, option))}
                className={`flex h-12 cursor-pointer items-center gap-3 rounded-xl px-4 text-left text-[14.5px] font-medium transition-[background-color,color,scale] duration-150 ease-out-strong active:scale-[0.98] ${on ? "bg-cream/[0.1] text-cream" : "bg-canvas text-ink-2 hover:bg-raised hover:text-ink"} ${focusRing}`}
              >
                <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[6px] transition-colors duration-150 ${on ? "bg-cream text-canvas" : "bg-raised"}`}>
                  <CheckIcon size={13} strokeWidth={2.4} className={`transition-[scale,opacity] duration-200 ease-out-strong ${on ? "scale-100 opacity-100" : "scale-50 opacity-0"}`} />
                </span>
                {option}
              </button>
            );
          })}
      </div>
    );
  }
