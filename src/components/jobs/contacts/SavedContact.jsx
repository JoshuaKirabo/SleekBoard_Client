import { useEffect, useState } from "react";
import useRun, { isLive } from "./useRun.js";
import { PersonName } from "./Suggestion.jsx";
import { KIND_LABELS, safeHref, shortDate } from "./contactText.js";
import { mainButton, pillButton, quietButton } from "./buttons.js";

// LinkedIn's limit on a note for a free account. The server holds notes to it too.
const NOTE_LIMIT = 200;

const STYLE_LABELS = { direct: "Direct", personal: "Personal" };

// One drafted note, its length against LinkedIn's limit, and a copy button. You send it yourself.
function NoteCard({ note })
  {
    const [copied, setCopied] = useState(false);

    useEffect(() =>
      {
        if(!copied) return;
        const timer = setTimeout(() => setCopied(false), 1600);
        return () => clearTimeout(timer);
      }, [copied]);

    const copy = async () =>
      {
        await navigator.clipboard.writeText(note.text);
        setCopied(true);
      };

    return (
      <li className="rounded-lg bg-surface p-3.5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] text-ink-3">{STYLE_LABELS[note.style] || note.style} · {note.text.length}/{NOTE_LIMIT}</span>
          <button type="button" onClick={copy} className={quietButton}>{copied ? "Copied" : "Copy"}</button>
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-ink">{note.text}</p>
      </li>
    );
  }

// The notes for this person: drafting, the two drafts, or why drafting stopped.
function Notes({ run })
  {
    if(!run) return null;
    if(isLive(run)) return <p className="mt-3 text-[12px] text-ink-3 motion-safe:animate-pulse">Drafting two notes…</p>;
    if(run.status === "failed") return <p className="mt-3 text-[13px] text-halt">{run.error}</p>;
    return (
      <ul className="mt-3 flex flex-col gap-2">
        {run.result.notes.map((note) => <NoteCard key={note.style} note={note} />)}
      </ul>
    );
  }

// How you know them, in a few words.
const knownBy = (contact) =>
  {
    if(contact.source === "linkedin") return contact.connectedOn ? `LinkedIn connection since ${shortDate(contact.connectedOn)}` : "LinkedIn connection";
    return contact.location;
  };

// Someone saved for this job: who they are, the proof the finder checked, and two notes to send them.
export default function SavedContact({ contact, noteRun, onDraft, onRemove, onRunUpdate })
  {
    useRun(noteRun, onRunUpdate);
    const drafting = isLive(noteRun);
    const profile = safeHref(contact.link);

    return (
      <li className="rounded-xl bg-raised/60 p-4">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-[14px]">
          <PersonName name={contact.name} link={contact.link} />
          <span className="text-[12px] text-ink-3">{KIND_LABELS[contact.type] || "Contact"}</span>
        </div>
        <p className="mt-0.5 text-[13px] text-ink-2">{[contact.title, knownBy(contact)].filter(Boolean).join(" · ")}</p>
        {contact.email && <p className="mt-0.5 text-[13px] text-ink-2">{contact.email}</p>}
        {contact.quote && <blockquote className="mt-2.5 text-[13px] leading-relaxed text-ink-3 italic">“{contact.quote}”</blockquote>}

        <div className="mt-3 flex flex-wrap items-center gap-1">
          <button type="button" disabled={drafting} onClick={() => onDraft(contact)} className={noteRun ? pillButton : mainButton}>
            {drafting ? "Drafting…" : noteRun ? "Redraft notes" : "Draft notes"}
          </button>
          {profile && <a href={profile} target="_blank" rel="noreferrer" className={pillButton}>Open profile</a>}
          <button type="button" onClick={() => onRemove(contact)} className={quietButton}>Remove from job</button>
        </div>

        <Notes run={noteRun} />
      </li>
    );
  }
