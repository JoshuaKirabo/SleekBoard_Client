import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { listJobs, createJob, updateJob, deleteJob, undoMove, getGmailStatus, disconnectGmail, problemOf } from "../services/api.js";
import JobsToolbar from "../components/jobs/JobsToolbar.jsx";
import JobBoard from "../components/jobs/JobBoard.jsx";
import JobTable from "../components/jobs/JobTable.jsx";
import JobDetail from "../components/jobs/JobDetail.jsx";
import AddJob from "../components/jobs/AddJob.jsx";
import GhostedDrawer from "../components/jobs/GhostedDrawer.jsx";
import MoveToast from "../components/jobs/MoveToast.jsx";
import { DRAWER_ID } from "../components/jobs/statuses.js";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

// While Gmail is connected the board asks for a fresh copy this often, so a card a reply moved shows up without a
// reload. The server checks Gmail every minute, so a card lands within about a minute and a half of the reply.
const REFRESH_MS = 20_000;

// Why Gmail didn't connect, in words, by the reason the server sends back.
const GMAIL_REASONS =
  {
    access_denied: "you said no on Google's screen",
    browser_mismatch: "start it again from this browser",
    state_expired: "the link timed out, try again",
    state_unknown: "the server restarted part way, try again",
    invalid_state: "the link back from Google wasn't right, try again",
    exchange_failed: "Google wouldn't finish it, try again",
    no_code: "Google didn't send a code back, try again",
  };

// Undo toasts whose card is still in the lane the reply put it in. The rest are out of date.
const stillWhereLeft = (queue, jobs) => queue.filter((move) => jobs.find((job) => job.id === move.id)?.status === move.to);

// The cards a reply moved between two copies of the board: the lane changed, and the last move came from email.
const emailMoves = (before, after) => after.flatMap((job) =>
  {
    const was = before.find((old) => old.id === job.id);
    const last = job.moves?.at(-1);
    if(!was || was.status === job.status || last?.source !== "email" || last.to !== job.status) return [];
    return [{ key: `${job.id}-${last.at}`, id: job.id, company: job.company, from: last.from, to: last.to }];
  });

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
    // Gmail's connection, null until the server answers.
    const [gmail, setGmail] = useState(null);
    // Cards a reply moved, waiting for their Undo toast, oldest first.
    const [moves, setMoves] = useState([]);
    const [params, setParams] = useSearchParams();
    // Saves still on their way. A refresh waits for them, or it could put a card you just moved back for a moment.
    const saving = useRef(0);
    const jobsNow = useRef(jobs);
    useEffect(() =>
      {
        jobsNow.current = jobs;
      });

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

    // Gmail's connection, asked for alongside the jobs.
    useEffect(() =>
      {
        let live = true;
        getGmailStatus()
          .then((status) => live && setGmail(status))
          .catch(() => live && setGmail(null));
        return () =>
          {
            live = false;
          };
      }, [attempt]);

    // Back from Google with ?gmail=connected or ?gmail=error&reason=…. Say how it went, then tidy the address bar.
    useEffect(() =>
      {
        const answer = params.get("gmail");
        if(!answer) return;
        const reason = params.get("reason") || "";
        setNotice(answer === "connected" ? "Gmail connected. Replies move your cards within a minute." : `Gmail didn't connect: ${GMAIL_REASONS[reason] || reason || "try again"}.`);
        setParams({}, { replace: true });
      }, [params, setParams]);

    // A fresh copy of the board and of Gmail's connection. Skipped while a save is on its way or a card is in your hand,
    // and the cards a reply moved since the last copy get an Undo toast.
    const refresh = useCallback(async () =>
      {
        if(saving.current || document.hidden || document.querySelector(".job-card.is-lifted")) return;
        let fresh;
        try
          {
            fresh = await listJobs();
          }
        catch
          {
            return;
          }
        if(saving.current || document.querySelector(".job-card.is-lifted")) return;
        const landed = emailMoves(jobsNow.current, fresh);
        setJobs(fresh);
        setMoves((queue) => [...stillWhereLeft(queue, fresh), ...landed]);
        // Gmail's connection too, so a login Google cut off shows Reconnect without a reload.
        getGmailStatus().then(setGmail).catch(() => {});
      }, []);

    // Only while Gmail's connected, since nothing else moves cards behind your back. Coming back to the tab refreshes
    // straight away.
    useEffect(() =>
      {
        if(gmail?.status !== "connected" || load.state !== "ready") return;
        const timer = setInterval(refresh, REFRESH_MS);
        window.addEventListener("focus", refresh);
        return () =>
          {
            clearInterval(timer);
            window.removeEventListener("focus", refresh);
          };
      }, [gmail?.status, load.state, refresh]);

    const disconnect = async () =>
      {
        try
          {
            setGmail(await disconnectGmail());
            setNotice("Gmail disconnected. Replies won't move your cards any more.");
          }
        catch(error)
          {
            setNotice(`Couldn't disconnect Gmail. ${problemOf(error)}`);
          }
      };

    // Puts a card a reply moved back where it was, as if the move never happened. Only while it's still in the lane the
    // reply put it in: if it has moved since, Undo would throw it all the way back past your own move.
    const undo = async (move) =>
      {
        setMoves((queue) => queue.filter((one) => one.key !== move.key));
        if(jobsNow.current.find((job) => job.id === move.id)?.status !== move.to) return;
        try
          {
            const back = await undoMove(move.id, move.from);
            setJobs((list) => list.map((job) => (job.id === back.id ? back : job)));
          }
        catch(error)
          {
            setNotice(`Couldn't undo ${move.company}. ${problemOf(error)}`);
          }
      };
    const nextMove = useCallback(() => setMoves((queue) => queue.slice(1)), []);

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

    // The server's copy of a job after something else changed it, like its Contact field filling in when you save
    // someone for it.
    const replaceJob = useCallback((fresh) => setJobs((list) => list.map((job) => (job.id === fresh.id ? fresh : job))), []);
    const closeGhosted = useCallback(() => setGhostedOpen(false), []);

    // A moved card goes to the top of its new lane, the same order the server sends back (most recently touched
    // first), so a refresh doesn't shuffle it. If the save fails it goes back to its old lane, unless you already
    // moved it again.
    const setStatus = (id, status) =>
      {
        const before = jobs.find((job) => job.id === id);
        if(!before || before.status === status) return;
        setJobs((list) => [{ ...before, status }, ...list.filter((job) => job.id !== id)]);
        // You moved it yourself, so any Undo still up for a reply's move on this card is out of date.
        setMoves((queue) => queue.filter((move) => move.id !== id));
        saving.current++;
        updateJob(id, { status })
          .then((saved) => setJobs((list) => list.map((job) => (job.id === id && job.status === status ? saved : job))))
          .catch((error) =>
            {
              setJobs((list) => list.map((job) => (job.id === id && job.status === status ? { ...job, status: before.status } : job)));
              setNotice(`Couldn't move ${before.company}. ${problemOf(error)}`);
            })
          .finally(() => saving.current--);
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
        return job;
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
        setMoves((queue) => queue.filter((move) => move.id !== id));
        saving.current++;
        deleteJob(id)
          .catch((error) =>
            {
              if(error.response?.status === 404) return;
              setJobs((list) => (list.some((job) => job.id === id) ? list : [...list.slice(0, index), gone, ...list.slice(index)]));
              setNotice(`Couldn't delete ${gone.company}. ${problemOf(error)}`);
            })
          .finally(() => saving.current--);
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
          gmail={gmail}
          onDisconnect={disconnect}
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
        <JobDetail job={selected} onClose={close} onStatus={setStatus} onDelete={removeJob} onJobChange={replaceJob} />
        <AddJob open={adding} onClose={closeAdd} onAdd={addJob} onJobChange={replaceJob} />

        {/* A save that didn't land, or a card a reply moved. They sit above the panels so you see them whatever is open. */}
        <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex flex-col items-center gap-2 px-4">
          <MoveToast move={moves[0]} onUndo={undo} onDone={nextMove} />
          {notice && <p key={notice} className="card-rise max-w-md rounded-full bg-raised px-4 py-2.5 text-center text-[13px] text-ink shadow-[0_20px_40px_-12px_rgba(0,0,0,0.7)]">{notice}</p>}
        </div>
      </div>
    );
  }
