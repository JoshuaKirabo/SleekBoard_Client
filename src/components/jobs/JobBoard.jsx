import { useRef, useState } from "react";
import { STATUSES } from "./statuses.js";
import JobCard from "./JobCard.jsx";

// Which lane is under a point on screen. Measured from the lane boxes themselves instead of hit-testing the DOM,
// so the card being dragged never gets in the way of its own drop.
const laneAt = (x, y) =>
  {
    const lanes = document.querySelectorAll("[data-lane]");
    for(const lane of lanes)
      {
        const box = lane.getBoundingClientRect();
        if(x >= box.left && x <= box.right && y >= box.top && y <= box.bottom) return lane.dataset.lane;
      }
    return null;
  };

// Lanes sit straight on the canvas, no tinted container around them. The cards are the only surfaces, and the thin rail
// under each lane title carries the status colour, so the row of rails reads as the pipeline left to right.
// Drag a card across and the lane it's over lights up. The landing ref hands the drop point to the card's new
// instance so it can spring into place from there.
export default function JobBoard({ jobs, selectedId, onOpen, onMove, freshId })
  {
    const [over, setOver] = useState(null);
    const landing = useRef(null);
    const hover = (lane) => setOver((current) => (current === lane ? current : lane));

    return (
      <div className="lanes -mx-5 flex flex-1 gap-2 overflow-x-auto px-3 pb-2 sm:-mx-7 sm:px-5 2xl:mx-0 2xl:grid 2xl:grid-cols-6 2xl:overflow-visible 2xl:px-0">
        {STATUSES.map((status) => {
          const lane = jobs.filter((job) => job.status === status.id);
          const active = over === status.id;

          return (
            <section
              key={status.id}
              data-lane={status.id}
              aria-label={status.label}
              className={`flex w-[264px] shrink-0 snap-start flex-col rounded-xl px-2 pt-2 transition-colors duration-150 2xl:-mx-2 2xl:w-auto ${active ? "bg-white/[0.035]" : ""}`}
            >
              <header className="flex items-center gap-2 pb-2.5">
                <span className={`h-2 w-2 rounded-full ${status.dot}`} aria-hidden="true" />
                <h2 className="text-[13px] font-medium">{status.label}</h2>
                <span className="text-[12px] text-ink-3 tabular-nums">{lane.length}</span>
              </header>
              <div className={`h-[2px] rounded-full transition-opacity duration-150 ${status.rail} ${over && !active ? "opacity-50" : ""}`} aria-hidden="true" />

              <ul className="mt-3 flex flex-1 flex-col gap-2.5 pb-2">
                {lane.map((job) => (
                  <li key={job.id}>
                    <JobCard job={job} selected={job.id === selectedId} fresh={job.id === freshId} onOpen={onOpen} onMove={onMove} laneAt={laneAt} onHover={hover} landing={landing} />
                  </li>
                ))}
                {lane.length === 0 && <li className={`rounded-xl px-3.5 py-5 text-center text-[12px] transition-colors duration-150 ${active ? "bg-raised text-ink-2" : "bg-surface/50 text-ink-3"}`}>{active ? "Drop it here" : status.empty}</li>}
              </ul>
            </section>
          );
        })}
      </div>
    );
  }
