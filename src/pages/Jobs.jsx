import { useState, useCallback, useEffect } from "react";
import { listJobs, createJob, updateJob, deleteJob, problemOf } from "../services/api.js";
import JobsToolbar from "../components/jobs/JobsToolbar.jsx";
import JobBoard from "../components/jobs/JobBoard.jsx";
import JobTable from "../components/jobs/JobTable.jsx";
import JobDetail from "../components/jobs/JobDetail.jsx";
import AddJob from "../components/jobs/AddJob.jsx";
import GhostedDrawer from "../components/jobs/GhostedDrawer.jsx";
import { DRAWER_ID } from "../components/jobs/statuses.js";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

// Every application in one place. The board is the default, the table is the same data flat, and clicking either
// opens the side panel. Ghosted ones sit in a drawer off the toolbar instead of taking a lane.
//
// The jobs live in Mongo. Moves and deletes show on screen straight away and save behind your back; if the save
// fails, the card goes back where it was and a note at the bottom says why. Adding waits for the server instead,
// since the card needs the id Mongo gives it.
export default function Jobs()
  {
    const [jobs, setJobs] = useState([]);
    // "loading" until the first list comes back, "ready" once it has, "down" when the server couldn't hand it over.
    // "offline" means it didn't answer at all, as opposed to answering with an error.
    const [load, setLoad] = useState({ state: "loading", problem: "", offline: false });
    const [attempt, setAttempt] = useState(0);
    const [notice, setNotice] = useState("");
    const [view, setView] = useState("board");
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [adding, setAdding] = useState(false);
    const [freshId, setFreshId] = useState(null);
    const [ghostedOpen, setGhostedOpen] = useState(false);
    // The lane a dragged card is over. Shared by the board and the toolbar, since the Ghosted chip is a lane too.
    const [over, setOver] = useState(null);

    // Fetches the board on the way in, and again on Try again. "live" drops an answer that comes back after you left.
    useEffect(() =>
      {
        let live = true;
        listJobs()
          .then((list) =>
            {
              if(!live) return;
              setJobs(list);
              setLoad({ state: "ready", problem: "", offline: false });
            })
          .catch((error) => live && setLoad({ state: "down", problem: problemOf(error), offline: !error.response }));
        return () =>
          {
            live = false;
          };
      }, [attempt]);

    const retry = () =>
      {
        setLoad({ state: "loading", problem: "", offline: false });
        setAttempt((count) => count + 1);
      };

    // A failed save gets five seconds on screen, then clears.
    useEffect(() =>
      {
        if(!notice) return;
        const timer = setTimeout(() => setNotice(""), 5000);
        return () => clearTimeout(timer);
      }, [notice]);

    const needle = query.trim().toLowerCase();
    const visible = needle ? jobs.filter((job) => `${job.company} ${job.role}`.toLowerCase().includes(needle)) : jobs;
    const selected = jobs.find((job) => job.id === selectedId) || null;

    const ghosted = visible.filter((job) => job.status === DRAWER_ID);
    const hover = useCallback((lane) => setOver((current) => (current === lane ? current : lane)), []);

    const close = useCallback(() => setSelectedId(null), []);
    const closeGhosted = useCallback(() => setGhostedOpen(false), []);

    // A moved card goes to the top of its new lane, the same order the server sends back (most recently touched
    // first), so a refresh doesn't shuffle it. If the save fails it goes back to its old lane, unless you already
    // moved it again.
    const setStatus = (id, status) =>
      {
        const before = jobs.find((job) => job.id === id);
        if(!before || before.status === status) return;
        setJobs((list) => [{ ...before, status }, ...list.filter((job) => job.id !== id)]);
        updateJob(id, { status }).catch((error) =>
          {
            setJobs((list) => list.map((job) => (job.id === id && job.status === status ? { ...job, status: before.status } : job)));
            setNotice(`Couldn't move ${before.company}. ${problemOf(error)}`);
          });
      };

    // The add sheet waits on this and shows the error itself, so a failed save keeps your draft open.
    // New cards go to the front of their lane so you can see them land, and the search clears so they aren't hidden.
    const closeAdd = useCallback(() => setAdding(false), []);
    const addJob = async (draft) =>
      {
        let job;
        try
          {
            job = await createJob(draft);
          }
        catch(error)
          {
            throw new Error(problemOf(error));
          }
        setJobs((list) => [job, ...list]);
        setQuery("");
        // The rise plays once. Clearing the flag after it lands keeps a later drag from replaying it in the new lane.
        setFreshId(job.id);
        setTimeout(() => setFreshId(null), 600);
      };

    // Gone from the board at once. If the server says no, it comes back in the same spot. A 404 means it was already
    // deleted, which is what we wanted anyway.
    const removeJob = (id) =>
      {
        const index = jobs.findIndex((job) => job.id === id);
        if(index === -1) return;
        const gone = jobs[index];
        setSelectedId(null);
        setJobs((list) => list.filter((job) => job.id !== id));
        deleteJob(id).catch((error) =>
          {
            if(error.response?.status === 404) return;
            setJobs((list) => (list.some((job) => job.id === id) ? list : [...list.slice(0, index), gone, ...list.slice(index)]));
            setNotice(`Couldn't delete ${gone.company}. ${problemOf(error)}`);
          });
      };

    return (
      <div className="flex min-h-0 w-full flex-1 flex-col gap-5">
        <JobsToolbar
          view={view}
          onView={setView}
          query={query}
          onQuery={setQuery}
          total={jobs.length}
          onAdd={() => setAdding(true)}
          ghosted={ghosted.length}
          ghostedOpen={ghostedOpen}
          onGhosted={() => setGhostedOpen((open) => !open)}
          dropping={over === DRAWER_ID}
        />

        {/* Until the jobs arrive the board would show every lane as empty, which reads as "you have nothing". A quiet
            line says what's actually going on instead. */}
        {load.state === "loading" && <p className="flex flex-1 items-center justify-center text-[13px] text-ink-3">Loading your jobs…</p>}
        {load.state === "down" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-1.5 text-center">
            <h2 className="text-[15px] font-semibold">Couldn't load your jobs</h2>
            <p className="max-w-sm text-[13px] text-ink-2">{load.problem} {load.offline ? "Start it with npm run dev in SleekBoard_Server, then try again." : "Try again in a moment."}</p>
            <button type="button" onClick={retry} className={`mt-3 h-9 cursor-pointer rounded-full bg-raised px-4 text-[13px] font-medium text-ink transition-opacity duration-100 hover:opacity-90 active:scale-[0.97] ${focusRing}`}>
              Try again
            </button>
          </div>
        )}
        {load.state === "ready" && (view === "board"
          ? <JobBoard jobs={visible} selectedId={selectedId} freshId={freshId} onOpen={setSelectedId} onMove={setStatus} over={over} onHover={hover} />
          : <JobTable jobs={visible} selectedId={selectedId} onOpen={setSelectedId} />)}

        {/* The drawer comes before the details panel so a card's details open on top of it. */}
        <GhostedDrawer open={ghostedOpen} jobs={ghosted} selectedId={selectedId} detailOpen={Boolean(selected)} onOpen={setSelectedId} onClose={closeGhosted} />
        <JobDetail job={selected} onClose={close} onStatus={setStatus} onDelete={removeJob} />
        <AddJob open={adding} onClose={closeAdd} onAdd={addJob} />

        {/* A save that didn't land. It sits above the panels so you see it whatever is open. */}
        <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          {notice && <p key={notice} className="card-rise max-w-md rounded-full bg-raised px-4 py-2.5 text-center text-[13px] text-ink shadow-[0_20px_40px_-12px_rgba(0,0,0,0.7)]">{notice}</p>}
        </div>
      </div>
    );
  }
