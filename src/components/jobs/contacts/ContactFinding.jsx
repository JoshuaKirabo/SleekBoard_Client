import Suggestion from "./Suggestion.jsx";
import { isLive } from "./useRun.js";
import { stepLine, elapsed } from "./contactText.js";

// The most searches a run gets. Mirrors SEARCHES in the server's ContactRun.js, so the wait reads as "3 of 5".
const SEARCHES = 5;

// Placeholder rows shown before anyone's confirmed, so the section has the shape of what's coming.
const MIN_PLACEHOLDERS = 2;

const isCall = (step, tool) => step.type === "tool" && step.text.startsWith(`${tool} `);

// How many times the run called a tool.
const calls = (steps, tool) => steps.filter((step) => isCall(step, tool)).length;

// How many calls to a tool went through. A call is logged before it's checked, and a failed check is logged right
// after it, so a call only counts once the next step shows it didn't break. That keeps the count from going up and
// back down when someone fails the check.
const wentThrough = (steps, tool) => steps.filter((step, index) => isCall(step, tool) && index + 1 < steps.length && !steps[index + 1].text.startsWith(`${tool}:`)).length;

// The newest step worth showing. A tool breaking is the AI correcting itself, so those stay in the log on the card.
const latestLine = (steps) =>
  {
    const shown = steps.findLast((step) => step.type !== "error");
    return shown ? stepLine(shown) : "";
  };

// The steps after the card was filled: the contact search's own part of the log. The last fill counts, since a first
// try can fail its check and be redone.
const searchSteps = (steps) =>
  {
    const filledAt = steps.findLastIndex((step) => isCall(step, "fill_job"));
    return filledAt === -1 ? [] : steps.slice(filledAt + 1);
  };

// Where the search has got to, in a few words.
const phaseText = (steps) =>
  {
    const confirmed = wentThrough(steps, "suggest_contact");
    if(confirmed) return confirmed === 1 ? "1 person confirmed" : `${confirmed} people confirmed`;
    const searched = Math.min(calls(steps, "web_search"), SEARCHES);
    if(searched) return `Search ${searched} of ${SEARCHES}`;
    return "Starting the search";
  };

// A row the size of a suggestion, with the same sweep as the wells while they're read.
const Placeholder = ({ order }) => (
  <li className="well-skeleton rise rounded-lg" data-loading style={{ "--i": order }}>
    <div className="h-24 rounded-lg" />
  </li>
);

// While the run looks: a pulsing dot, where it's got to and for how long, its latest step easing in, and a
// placeholder row per person still to come. A newly confirmed person adds a row.
function Searching({ run })
  {
    const steps = searchSteps(run.steps || []);
    const latest = latestLine(steps);
    const rows = Math.max(MIN_PLACEHOLDERS, wentThrough(steps, "suggest_contact"));

    return (
      <>
        <div className="flex items-center gap-2 text-[12px]">
          <span className="h-1.5 w-1.5 rounded-full bg-cream motion-safe:animate-pulse" />
          <span className="text-ink">{phaseText(steps)}</span>
          <span className="text-ink-3 tabular-nums">{elapsed(run)}</span>
        </div>
        <p className="mt-1 min-h-5 text-[12px] text-ink-3">
          <span key={latest} className="step-swap block truncate">{latest}</span>
        </p>
        <ul aria-hidden="true" className="mt-2.5 flex flex-col gap-2">
          {Array.from({ length: rows }, (_, index) => <Placeholder key={index} order={index} />)}
        </ul>
      </>
    );
  }

// Once the run ends: the people it found, sliding up one after another, each with yes or no.
function Found({ run, picks, onAnswer })
  {
    const contacts = run.result?.contacts || [];
    if(run.status === "failed") return <p className="text-[13px] text-halt">{run.error || "The search stopped."}</p>;
    if(!contacts.length) return <p className="text-[13px] text-ink-2">Nobody could be confirmed this time.</p>;

    return (
      <ul className="flex flex-col gap-2">
        {contacts.map((contact, index) => (
          <Suggestion
            key={`${run.id}-${index}`}
            contact={{ ...contact, decision: picks[index] }}
            pending
            className="rise"
            style={{ "--i": index }}
            onDecide={async (decision) => onAnswer(index, contact, decision)}
          />
        ))}
      </ul>
    );
  }

// Fill in's "Who to contact", from the moment the card is filled. It shows the search working, then who it found.
export default function ContactFinding({ run, picks, onAnswer })
  {
    const live = isLive(run);

    return (
      <section aria-busy={live} className="rise mt-6" style={{ "--i": 0 }}>
        <span className="mb-1.5 block text-[12px] font-medium text-ink-3">Who to contact</span>
        {live ? <Searching run={run} /> : <Found run={run} picks={picks} onAnswer={onAnswer} />}
      </section>
    );
  }
