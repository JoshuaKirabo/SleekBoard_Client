import useRun, { isLive } from "./useRun.js";
import Suggestion from "./Suggestion.jsx";
import { stepLine, cents, elapsed, plainNote } from "./contactText.js";

const STATUS_LINES = { queued: "Waiting for a free slot", running: "Looking for someone", done: "Done", failed: "Stopped" };

// Where the run's at, how long it's taken and what it's cost so far. A soft pulse while it's working.
function StatusLine({ run })
  {
    const live = isLive(run);
    const facts = [elapsed(run), run.cost ? cents(run.cost) : ""].filter(Boolean).join(" · ");
    return (
      <div className="flex items-center gap-2 text-[12px]">
        <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-cream motion-safe:animate-pulse" : run.status === "failed" ? "bg-halt" : "bg-go"}`} />
        <span className="text-ink">{STATUS_LINES[run.status]}</span>
        {facts && <span className="text-ink-3">{facts}</span>}
      </div>
    );
  }

// The run's log, a line per step: what it searched, what it read, who it suggested, and anything that broke.
function Steps({ steps })
  {
    return (
      <ol className="mt-2.5 flex flex-col gap-1.5">
        {steps.map((step, index) => (
          <li key={index} className={`text-[12px] leading-relaxed ${step.type === "error" ? "text-halt" : step.type === "message" ? "text-ink-3 italic" : "text-ink-2"}`}>
            {stepLine(step)}
          </li>
        ))}
      </ol>
    );
  }

// One contact-finder run. While it works, the log fills in live. Once it's done, the log folds away behind a toggle
// and the people it found take its place, each with Save and Not this one.
export default function RunView({ run, onUpdate, onDecide })
  {
    useRun(run, onUpdate);
    const contacts = run.result?.contacts || [];
    const done = run.status === "done";

    return (
      <div className="mt-3 rounded-xl bg-raised/60 p-4">
        <StatusLine run={run} />
        {!done && <Steps steps={run.steps} />}
        {run.status === "failed" && <p className="mt-2.5 text-[13px] text-halt">{run.error}</p>}

        {done && (
          <>
            {contacts.length
              ? (
                <ul className="mt-3 flex flex-col gap-2">
                  {contacts.map((contact, index) => <Suggestion key={`${run.id}-${index}`} contact={contact} onDecide={(decision) => onDecide(run, index, decision)} />)}
                </ul>
              )
              : <p className="mt-2.5 text-[13px] text-ink-2">Nobody could be confirmed this time.</p>}
            {run.result?.note && <p className="mt-3 line-clamp-4 text-[12px] leading-relaxed text-ink-3">{plainNote(run.result.note)}</p>}
            <details className="mt-3 text-[12px] text-ink-3">
              <summary className="cursor-pointer select-none hover:text-ink-2">How it got there ({run.steps.length} steps)</summary>
              <Steps steps={run.steps} />
            </details>
          </>
        )}
      </div>
    );
  }
