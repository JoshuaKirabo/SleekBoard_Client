import { focusRing } from "./styles.js";

const clearLink = `cursor-pointer rounded-md text-[13px] font-medium text-ink-3 transition-colors duration-150 hover:text-ink ${focusRing}`;

// One question in the popup: its name, then whatever you answer it with. Give it
// `onClear` and it shows a Clear all link beside the name, but only while there's something to clear. `required`
// marks the fields a hunt can't start without.
export function Field({ label, onClear, required = false, children })
  {
    return (
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <h4 className="flex items-baseline gap-2 text-[14.5px] font-semibold">
            {label}
            {required && <span className="text-[12px] font-medium text-cream/80">Required</span>}
          </h4>
          {onClear && <button type="button" onClick={onClear} className={clearLink}>Clear all</button>}
        </div>
        <div className="mt-3">{children}</div>
      </div>
    );
  }
