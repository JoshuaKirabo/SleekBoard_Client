import { useEffect } from "react";
import { statusById, DRAWER_ID } from "./statuses.js";
import JobCard from "./JobCard.jsx";
import { CloseIcon, GhostIcon } from "../icons.jsx";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";
const status = statusById(DRAWER_ID);

// Where the applications that went quiet are kept, out of the pipeline but not thrown away. Opens from the toolbar
// chip and slides in from the right like the details panel, on the same frosted layer, so it reads as the same
// family. Tapping a card opens its details over the drawer; Escape closes the details first, then the drawer.
// The shadow only exists while it's open. Parked off the right edge, the sheet's shadow would still fall back onto
// the page as a dark band down the side of the screen.
export default function GhostedDrawer({ open, jobs, selectedId, detailOpen, onOpen, onClose })
  {
    useEffect(() =>
      {
        if(!open) return;
        const onKey = (event) => event.key === "Escape" && !detailOpen && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
      }, [open, detailOpen, onClose]);

    return (
      <aside
        aria-label="Ghosted applications"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-y-0 right-0 z-30 flex w-full flex-col bg-surface/90 backdrop-blur-xl transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:w-[400px] ${open ? "translate-x-0 shadow-[-32px_0_64px_-32px_rgba(0,0,0,0.7)]" : "translate-x-full shadow-none"}`}
      >
        <div className="flex h-[76px] shrink-0 items-center justify-between pr-5 pl-6">
          <div className="flex items-center gap-2.5">
            <GhostIcon size={17} className="text-ink-2" />
            <h2 className="text-[17px] font-semibold tracking-tight">Ghosted</h2>
            <span className="text-[13px] text-ink-3 tabular-nums">{jobs.length}</span>
          </div>
          <button type="button" onClick={onClose} className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink ${focusRing}`} aria-label="Close ghosted">
            <CloseIcon size={16} />
          </button>
        </div>

        <p className="px-6 text-[13px] leading-relaxed text-ink-3">They went quiet on you. Kept out of the way in case one writes back. Open a card to move it back onto the board.</p>

        <ul className="lane-scroll mt-5 flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto px-4 pb-6">
          {jobs.map((job) => (
            <li key={job.id}>
              <JobCard job={job} still selected={job.id === selectedId} onOpen={onOpen} />
            </li>
          ))}
          {jobs.length === 0 && <li className="rounded-xl bg-canvas/40 px-3.5 py-6 text-center text-[12px] text-ink-3">{status.empty}</li>}
        </ul>
      </aside>
    );
  }
