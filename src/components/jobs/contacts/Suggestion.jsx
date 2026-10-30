import { useState } from "react";
import { CheckIcon, ChevronDownIcon } from "../../icons.jsx";
import { KIND_LABELS, safeHref, shortLink } from "./contactText.js";
import { mainButton, quietButton } from "./buttons.js";

// The person's name, as a link to the page that proved it when that link is safe to open.
export function PersonName({ name, link, className = "font-medium text-ink" })
  {
    const href = safeHref(link);
    if(!href) return <span className={className}>{name}</span>;
    return <a href={href} target="_blank" rel="noreferrer" className={`${className} underline-offset-2 hover:underline`}>{name}</a>;
  }

// The role pill takes the board's status scale, so who to approach first stands out: cream for the recruiter, Board
// Blue for whoever runs the team, and plain grey for everyone else.
const PILL_TONES =
  {
    recruiter: "bg-cream/[0.24] text-cream",
    hiring_manager: "bg-board-light/70 text-board-bright",
  };

function RolePill({ type })
  {
    const tone = PILL_TONES[type] || "bg-raised text-ink-3";
    return <span className={`inline-flex h-5 shrink-0 items-center rounded-full px-2 text-[11px] font-medium ${tone}`}>{KIND_LABELS[type] || "Contact"}</span>;
  }

// "LinkedIn" for a LinkedIn page, otherwise the site's own name, for the proof line.
const siteName = (link) =>
  {
    const host = shortLink(link).split("/")[0];
    return host === "linkedin.com" ? "LinkedIn" : host;
  };

// linkedin.com/in/rwilson84 as rwilson84: the handle is all that tells two profiles apart.
const handleOf = (link) => shortLink(link).split("/").filter(Boolean).at(-1) || "";

// The proof, folded to one line: a check, where it was confirmed, and the handle. Opening it shows the words the page
// actually says. The quote slides open on grid rows, which is a transition, so a second tap mid-way reverses it
// from where it is instead of jumping.
function Proof({ contact })
  {
    const [open, setOpen] = useState(false);
    const site = siteName(contact.link);

    return (
      <div className="mt-3">
        <button type="button" onClick={() => setOpen((current) => !current)} aria-expanded={open} className="group flex max-w-full cursor-pointer items-center gap-1.5 text-[12px] text-ink-3 transition-colors duration-150 hover:text-ink-2">
          <CheckIcon size={12} className="shrink-0 text-go" />
          <span className="shrink-0">Verified on {site}</span>
          {handleOf(contact.link) && <span className="truncate">· {handleOf(contact.link)}</span>}
          <ChevronDownIcon size={12} className={`shrink-0 transition-transform duration-200 ease-out-strong ${open ? "rotate-180" : ""}`} />
        </button>
        <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out-strong ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <blockquote className="overflow-hidden text-[12.5px] leading-relaxed text-ink-3 italic">
            <span className="block pt-2">“{contact.quote}”</span>
          </blockquote>
        </div>
      </div>
    );
  }

// What you've already said about a suggestion. pending is the add sheet, where the job doesn't exist yet.
function Decided({ decision, pending })
  {
    if(decision === "accept")
      {
        return (
          <p className="mt-4 flex h-8 items-center gap-1.5 text-[12.5px] font-medium text-go">
            <CheckIcon size={14} />
            {pending ? "Saved with the job when you add it" : "Saved to this job's contacts"}
          </p>
        );
      }
    return <p className="mt-4 flex h-8 items-center text-[12.5px] text-ink-3">Passed on</p>;
  }

// One person a run suggested, in a well of their own: who they are, why them, the proof folded to a line, and yes or
// no. Nothing is saved until you say yes. Passing on someone sinks their well back so the rest stand forward.
// className and style let a list stagger its rows in.
export default function Suggestion({ contact, onDecide, pending = false, className = "", style })
  {
    const [busy, setBusy] = useState(false);

    const decide = async (decision) =>
      {
        setBusy(true);
        try
          {
            await onDecide(decision);
          }
        finally
          {
            setBusy(false);
          }
      };

    const place = contact.location && contact.location !== "unknown" ? contact.location : "";
    const passed = contact.decision === "reject";

    return (
      <li className={`rounded-2xl bg-canvas px-4.5 py-4 transition-opacity duration-300 ease-out-strong ${passed ? "opacity-55" : ""} ${className}`} style={style}>
        <div className="flex items-center gap-2">
          <PersonName name={contact.name} link={contact.link} className="truncate text-[15px] font-semibold tracking-[-0.01em] text-ink" />
          <RolePill type={contact.type} />
        </div>
        <p className="mt-1 text-[13px] text-ink-3">{[contact.title, place].filter(Boolean).join(" · ")}</p>
        {contact.reason && <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">{contact.reason}</p>}
        <Proof contact={contact} />
        {contact.decision
          ? <Decided decision={contact.decision} pending={pending} />
          : (
            <div className="mt-4 flex items-center gap-1">
              <button type="button" disabled={busy} onClick={() => decide("accept")} className={mainButton}>Save contact</button>
              <button type="button" disabled={busy} onClick={() => decide("reject")} className={quietButton}>Not this one</button>
            </div>
          )}
      </li>
    );
  }
