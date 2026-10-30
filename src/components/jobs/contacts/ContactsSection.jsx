import { useCallback, useEffect, useState } from "react";
import { getJobContacts, listRuns, startRun, decideSuggestion, takeWarmLead, removeJobContact, getConnections, problemOf } from "../../../services/api.js";
import { SparkleIcon } from "../../icons.jsx";
import RunView from "./RunView.jsx";
import SavedContact from "./SavedContact.jsx";
import WarmLeads from "./WarmLeads.jsx";
import ConnectionsBar from "./ConnectionsBar.jsx";
import { isLive } from "./useRun.js";
import { mainButton, pillButton } from "./buttons.js";

// The finder's button, worded for where you are. With warm leads showing, a search is the second choice, as in
// career-ops, where it's what you do when you'd rather not use someone you know.
const findLabel = ({ leads, saved, ran }) =>
  {
    if(leads) return "Search cold instead";
    return saved || ran ? "Find another" : "Find a contact";
  };

// The Contacts part of a job's panel: who's saved for it, people you already know at the company, the contact finder
// and its live log, and your LinkedIn connections. The panel keys it by job, so opening another card starts fresh.
export default function ContactsSection({ job, onJobChange })
  {
    const [book, setBook] = useState(null);
    const [runs, setRuns] = useState([]);
    const [connections, setConnections] = useState(null);
    const [problem, setProblem] = useState("");

    useEffect(() =>
      {
        let stale = false;
        Promise.all([getJobContacts(job.id), listRuns(job.id), getConnections()])
          .then(([contacts, list, summary]) =>
            {
              if(stale) return;
              setBook(contacts);
              setRuns(list);
              setConnections(summary);
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

    const find = () => attempt(async () => addRun(await startRun("contact", job.id)));

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

    const contactRun = runs.find((run) => run.kind === "contact");
    const noteRunFor = (contact) => runs.find((run) => run.kind === "note" && run.input?.contact === contact.id);
    const hasLeads = Boolean(book && (book.leads.contacts.length || book.leads.connections.length));
    const quiet = book && !book.saved.length && !contactRun && !hasLeads;

    return (
      <section className="mt-8" aria-label="Contacts">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[12px] text-ink-3">Contacts</h3>
          <button type="button" disabled={!book || isLive(contactRun)} onClick={find} className={hasLeads ? pillButton : mainButton}>
            <SparkleIcon size={13} />
            {isLive(contactRun) ? "Searching…" : findLabel({ leads: hasLeads, saved: book?.saved.length, ran: Boolean(contactRun) })}
          </button>
        </div>

        {problem && <p className="mt-2 text-[13px] text-halt" role="alert">{problem}</p>}
        {!book && !problem && <p className="mt-2 text-[13px] text-ink-3">Loading contacts…</p>}

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
