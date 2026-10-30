import { useState } from "react";
import { CheckIcon } from "../../icons.jsx";
import { KIND_LABELS, safeHref, shortLink } from "./contactText.js";
import { mainButton, quietButton } from "./buttons.js";

// The person's name, as a link to the page that proved it when that link is safe to open.
export function PersonName({ name, link })
  {
    const href = safeHref(link);
    if(!href) return <span className="font-medium text-ink">{name}</span>;
    return <a href={href} target="_blank" rel="noreferrer" className="font-medium text-ink underline-offset-2 hover:underline">{name}</a>;
  }

// What you've already said about a suggestion. pending is the add sheet, where the job doesn't exist yet.
function Decided({ decision, pending })
  {
    if(decision === "accept")
      {
        return (
          <p className="mt-3 flex items-center gap-1.5 text-[12px] text-go">
            <CheckIcon size={13} />
            {pending ? "Saved with the job when you add it" : "Saved to this job's contacts"}
          </p>
        );
      }
    return <p className="mt-3 text-[12px] text-ink-3">Passed on</p>;
  }

// One person a run suggested, with the words that prove they work there, and yes or no. Nothing is saved until you
// say yes.
export default function Suggestion({ contact, onDecide, pending = false })
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

    return (
      <li className="rounded-lg bg-surface p-3.5">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[14px]">
          <PersonName name={contact.name} link={contact.link} />
          <span className="text-[12px] text-ink-3">{KIND_LABELS[contact.type] || "Contact"}</span>
        </div>
        <p className="mt-0.5 text-[13px] text-ink-2">{[contact.title, place].filter(Boolean).join(" · ")}</p>
        <blockquote className="mt-2.5 text-[13px] leading-relaxed text-ink-2 italic">“{contact.quote}”</blockquote>
        <p className="mt-1 truncate text-[11px] text-ink-3">{shortLink(contact.link)}</p>
        {contact.reason && <p className="mt-2 text-[13px] leading-relaxed text-ink">{contact.reason}</p>}
        {contact.decision
          ? <Decided decision={contact.decision} pending={pending} />
          : (
            <div className="mt-3 flex items-center gap-1">
              <button type="button" disabled={busy} onClick={() => decide("accept")} className={mainButton}>Save contact</button>
              <button type="button" disabled={busy} onClick={() => decide("reject")} className={quietButton}>Not this one</button>
            </div>
          )}
      </li>
    );
  }
