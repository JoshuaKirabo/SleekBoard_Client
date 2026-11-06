import { focusRing } from "./styles.js";

// An on/off switch with its label. The knob slides; the track takes the cream when it's on.
export default function Switch({ label, on, onChange })
  {
    return (
      <button type="button" role="switch" aria-checked={on} onClick={() => onChange(!on)} className={`flex cursor-pointer items-center gap-3 rounded-full text-[14px] font-medium text-ink-2 transition-colors duration-150 hover:text-ink ${focusRing}`}>
        {label}
        <span className={`relative h-6 w-10 rounded-full transition-colors duration-200 ${on ? "bg-cream" : "bg-raised"}`}>
          <span className={`absolute top-1 left-1 h-4 w-4 rounded-full transition-[translate,background-color] duration-200 ease-out-strong ${on ? "translate-x-4 bg-canvas" : "translate-x-0 bg-ink-2"}`} />
        </span>
      </button>
    );
  }
