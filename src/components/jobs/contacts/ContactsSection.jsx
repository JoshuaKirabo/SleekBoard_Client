import { useCallback, useEffect, useState } from "react";
import { getJobContacts, startRun, decideSuggestion, takeWarmLead, removeJobContact, getConnections, problemOf } from "../../../services/api.js";
import { SparkleIcon } from "../../icons.jsx";
import RunView from "./RunView.jsx";
import SavedContact from "./SavedContact.jsx";
import WarmLeads from "./WarmLeads.jsx";
import ConnectionsBar from "./ConnectionsBar.jsx";
import { mainButton, pillButton } from "./buttons.js";
import { contactsStore } from "./ContactsStore.js";

// The finder's button only shows while a job has nobody yet: no one saved and no search run for it. Once a search has
// run, its results (or its live log) take the button's place. A search that failed leaves the button, so it can be
// tried again. With warm leads showing, a search is the second choice, as in career-ops, where it's what you do when
// you'd rather not use someone you know.
const canFind = ({ saved, run }) => !saved && (!run || run.status === "failed");

const findLabel = (leads) => (leads ? "Search cold instead" : "Find a contact");

// The Contacts part of a job's panel: who's saved for it, people you already know at the company, the contact finder
// and its live log, and your LinkedIn connections. The panel keys it by job, so opening another card starts fresh.
// It opens on whatever ContactsStore already has for the job (usually fetched while the pointer was on the card), and
// swaps in a fresh copy when that lands.
export default function ContactsSection({ job, onJobChange })
  {
    const kept = contactsStore.peek(job.id);
    const [book, setBook] = useState(kept?.book || null);
    const [runs, setRuns] = useState(kept?.runs || []);
    const [connections, setConnections] = useState(kept?.connections || null);
    const [problem, setProblem] = useState("");
    const [starting, setStarting] = useState(false);

    useEffect(() =>
      {
        let stale = false;
        contactsStore.load(job.id)
          .then((fresh) =>
            {
              if(stale) return;
              setBook(fresh.book);
              setRuns(fresh.runs);
              setConnections(fresh.connections);
            })
          .catch((error) =>
            {
              if(!stale) setProblem(problemOf(error));
            });
        return () =>
          {
            stale = true;
          };
      }, [job.id]);

    // Whatever changes here (a contact saved, a run moving on) goes back to the store, so the next open shows it.
    useEffect(() =>
      {
        if(book) contactsStore.update(job.id, { book, runs, connections });
      }, [job.id, book, runs, connections]);

    const loadBook = async () => setBook(await getJobContacts(job.id));
    const addRun = (run) => setRuns((list) => [run, ...list]);
    const updateRun = useCallback((fresh) => setRuns((list) => list.map((run) => (run.id === fresh.id ? fresh : run))), []);

    // Every button below goes through here, so whatever the server says no to shows up as one line under the heading.
    const attempt = async (work) =>
      {
        setProblem("");
        try
          {
            await work();
          }
        catch(error)
          {
            setProblem(problemOf(error));
          }
      };

    // Held while the run is being asked for, so a double press can't start two paid searches.
    const find = () => attempt(async () =>
      {
        setStarting(true);
        try
          {
            addRun(await startRun("contact", job.id));
          }
        finally
          {
            setStarting(false);
          }
      });

    const draft = (contact) => attempt(async () => addRun(await startRun("note", job.id, contact.id)));

    const decide = (run, index, decision) => attempt(async () =>
      {
        const answer = await decideSuggestion(run.id, index, decision);
        updateRun(answer.run);
        if(!answer.contact) return;
        onJobChange(answer.job);
        await loadBook();
      });

    const take = (lead) => attempt(async () =>
      {
        const answer = await takeWarmLead(job.id, lead.kind === "connection" ? { connection: lead.id } : { contact: lead.id });
        onJobChange(answer.job);
        await loadBook();
      });

    const remove = (contact) => attempt(async () =>
      {
        await removeJobContact(job.id, contact.id);
        await loadBook();
      });

    const connectionsChanged = () => attempt(async () =>
      {
        const [summary] = await Promise.all([getConnections(), loadBook()]);
        setConnections(summary);
      });

    // A Fill in run finds contacts too, so the card picks up its suggestions when it's the latest.
    const contactRun = runs.find((run) => run.kind === "contact" || run.kind === "fill");
    const noteRunFor = (contact) => runs.find((run) => run.kind === "note" && run.input?.contact === contact.id);
    const hasLeads = Boolean(book && (book.leads.contacts.length || book.leads.connections.length));
    const quiet = book && !book.saved.length && !contactRun && !hasLeads;

    return (
      <section className="mt-8" aria-label="Contacts">
        <div className="flex min-h-8 items-center justify-between gap-3">
          <h3 className="text-[12px] text-ink-3">Contacts</h3>
          {book && canFind({ saved: book.saved.length, run: contactRun }) && (
            <button type="button" disabled={starting} onClick={find} className={hasLeads ? pillButton : mainButton}>
              <SparkleIcon size={13} />
              {starting ? "Starting…" : findLabel(hasLeads)}
            </button>
          )}
        </div>

        {problem && <p className="mt-2 text-[13px] text-halt" role="alert">{problem}</p>}
        {/* Only said when it's slow: most loads land while the panel is still sliding in, and a line that flashes for a
            moment reads as a glitch. See .late-reveal. */}
        {!book && !problem && <p className="late-reveal mt-2 text-[13px] text-ink-3">Loading contacts…</p>}

        {book && (
          <>
            {quiet && <p className="mt-2 text-[13px] leading-relaxed text-ink-3">Nobody yet. The finder looks for the hiring manager, then a recruiter, then someone on the team, and only suggests people it can prove work there now. About 2¢ a search.</p>}

            {book.saved.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2">
                {book.saved.map((contact) => <SavedContact key={contact.id} contact={contact} noteRun={noteRunFor(contact)} onDraft={draft} onRemove={remove} onRunUpdate={updateRun} />)}
              </ul>
            )}

            <WarmLeads company={job.company} leads={book.leads} onTake={take} />
            {contactRun && <RunView run={contactRun} onUpdate={updateRun} onDecide={decide} />}
            <ConnectionsBar summary={connections} secondDegreeSearch={book.leads.secondDegreeSearch} onChange={connectionsChanged} />
          </>
        )}
      </section>
    );
  }
