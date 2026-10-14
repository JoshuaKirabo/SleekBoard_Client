import { statusById, shortDate } from "./statuses.js";
import { Monogram } from "./JobCard.jsx";

const COLUMNS = ["Company", "Role", "Location", "Status", "Applied", "Deadline", "Contact"];

// Same list as the board, laid flat. Clicking a row opens the same panel the cards do.
export default function JobTable({ jobs, selectedId, onOpen })
  {
    return (
      <div className="overflow-hidden rounded-2xl bg-surface">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-[12px] font-medium text-ink-3">
                {COLUMNS.map((column) => (
                  <th key={column} scope="col" className="h-11 bg-canvas/40 px-4 font-medium first:pl-5 last:pr-5">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const status = statusById(job.status);
                const selected = job.id === selectedId;

                return (
                  <tr
                    key={job.id}
                    onClick={() => onOpen(job.id)}
                    className={`cursor-pointer transition-colors duration-100 hover:bg-raised active:bg-raised ${selected ? "bg-raised" : ""}`}
                  >
                    <td className="h-13 px-4 pl-5">
                      <span className="flex items-center gap-2.5">
                        <Monogram name={job.company} size="h-7 w-7 text-[12px]" />
                        <span className="font-semibold">{job.company}</span>
                      </span>
                    </td>
                    <td className="px-4 text-ink">{job.role}</td>
                    <td className="px-4 text-ink-2">{job.location}</td>
                    <td className="px-4">
                      <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${status.dot}`} aria-hidden="true" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 text-ink-2 tabular-nums">{shortDate(job.applied) || "—"}</td>
                    <td className="px-4 text-ink-2 tabular-nums">{shortDate(job.deadline) || "—"}</td>
                    <td className="px-4 pr-5 text-ink-2">{job.contact || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {jobs.length === 0 && <p className="px-5 py-10 text-center text-[13px] text-ink-3">No applications match that search.</p>}
      </div>
    );
  }
