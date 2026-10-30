import { useEffect } from "react";
import { MailIcon } from "../icons.jsx";
import { statusById } from "./statuses.js";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

// How long a move stays up for undoing.
const SHOW_MS = 8000;

// "Kpler moved to Rejected from a reply. Undo." One at a time, the oldest first; each gets eight seconds, then the
// next one shows. Undo puts the card back as if the move never happened.
export default function MoveToast({ move, onUndo, onDone })
  {
    useEffect(() =>
      {
        if(!move) return;
        const timer = setTimeout(onDone, SHOW_MS);
        return () => clearTimeout(timer);
      }, [move, onDone]);

    if(!move) return null;
    const lane = statusById(move.to)?.label || move.to;

    return (
      <div key={move.key} className="card-rise pointer-events-auto flex max-w-md items-center gap-3 rounded-full bg-raised py-2 pr-2 pl-4 text-[13px] text-ink shadow-[0_20px_40px_-12px_rgba(0,0,0,0.7)]">
        <MailIcon size={15} className="shrink-0 text-ink-3" />
        <p className="min-w-0 truncate">{move.company} moved to {lane} from a reply.</p>
        <button type="button" onClick={() => onUndo(move)} className={`h-7 shrink-0 cursor-pointer rounded-full bg-surface px-3 text-[12px] font-medium text-cream transition-colors duration-150 hover:bg-canvas active:scale-[0.97] ${focusRing}`}>
          Undo
        </button>
      </div>
    );
  }
