import { useState } from "react";
import { ChevronDownIcon } from "../../icons.jsx";
import { focusRing } from "./styles.js";

const clearLink = `cursor-pointer rounded-md text-[13px] font-medium text-ink-3 transition-colors duration-150 hover:text-ink ${focusRing}`;

// One question in the popup: its name, then whatever you answer it with. Give it
// `onClear` and it shows a Clear all link beside the name, but only while there's something to clear.
export function Field({ label, onClear, children })
  {
    return (
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <h4 className="text-[14.5px] font-semibold">{label}</h4>
          {onClear && <button type="button" onClick={onClear} className={clearLink}>Clear all</button>}
        </div>
        <div className="mt-3">{children}</div>
      </div>
    );
  }

// A field most people never need, folded away until asked for. It opens on its own when it already holds picks,
// so nothing you chose is ever hidden. The fold slides open on the grid row, the one height change we allow.
export function Folded({ label, count, children })
  {
    const [open, setOpen] = useState(count > 0);

    return (
      <div>
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className={`flex cursor-pointer items-center gap-1.5 rounded-md text-[14px] font-medium text-ink-2 transition-colors duration-150 hover:text-ink ${focusRing}`}>
          <ChevronDownIcon size={15} className={`transition-[rotate] duration-200 ease-out-strong ${open ? "rotate-0" : "-rotate-90"}`} />
          {label}
          {count > 0 && <span className="text-cream">{count}</span>}
        </button>
        <div className={`grid transition-[grid-template-rows,opacity] duration-250 ease-out-strong ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="min-h-0 overflow-hidden" inert={!open}>
            <div className="pt-3">{children}</div>
          </div>
        </div>
      </div>
    );
  }
