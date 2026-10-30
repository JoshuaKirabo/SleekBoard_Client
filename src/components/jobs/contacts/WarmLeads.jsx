import { useState } from "react";
import { PersonName } from "./Suggestion.jsx";
import { shortDate } from "./contactText.js";
import { pillButton } from "./buttons.js";

// Where a lead comes from, and the company the way they're saved under when it isn't spelled like this job's, so you
// can tell "Epic Systems" from "Epic Games" yourself.
const whereFrom = (lead, company) =>
  {
    const other = lead.company.trim().toLowerCase() !== company.trim().toLowerCase() ? lead.company : "";
    if(lead.kind === "connection")
      {
        const since = lead.connectedOn ? ` since ${shortDate(lead.connectedOn)}` : "";
        return [`LinkedIn connection${since}`, other && `LinkedIn says ${other}`].filter(Boolean).join(" · ");
      }
    return other ? `Saved for a job at ${other}` : "Saved for an earlier job here";
  };

function Lead({ lead, company, onTake })
  {
    const [busy, setBusy] = useState(false);

    const take = async () =>
      {
        setBusy(true);
        try
          {
            await onTake(lead);
          }
        finally
          {
            setBusy(false);
          }
      };

    return (
      <li className="flex items-center justify-between gap-3 rounded-lg bg-surface px-3.5 py-3">
        <div className="min-w-0">
          <div className="truncate text-[14px]"><PersonName name={lead.name} link={lead.link || lead.linkedin} /></div>
          <p className="truncate text-[12px] text-ink-3">{[lead.title, whereFrom(lead, company)].filter(Boolean).join(" · ")}</p>
        </div>
        <button type="button" disabled={busy} onClick={take} className={pillButton}>Use for this job</button>
      </li>
    );
  }

// career-ops' first step, before any search: people you already know at this company. Picking one costs nothing, since
// no run starts. They're shown above the search so you see them before paying for a cold one.
export default function WarmLeads({ company, leads, onTake })
  {
    const list =
      [
        ...leads.contacts.map((contact) => ({ ...contact, kind: "contact" })),
        ...leads.connections.map((connection) => ({ ...connection, kind: "connection" })),
      ];
    if(!list.length) return null;

    return (
      <div className="mt-3 rounded-xl bg-board-deep/60 p-4">
        <p className="text-[13px] text-ink">You already know {list.length === 1 ? "someone" : `${list.length} people`} at {company}</p>
        <p className="mt-0.5 text-[12px] text-ink-3">A warm lead beats a cold search. Pick one, or search cold instead.</p>
        <ul className="mt-3 flex flex-col gap-1.5">
          {list.map((lead) => <Lead key={`${lead.kind}-${lead.id}`} lead={lead} company={company} onTake={onTake} />)}
        </ul>
      </div>
    );
  }
