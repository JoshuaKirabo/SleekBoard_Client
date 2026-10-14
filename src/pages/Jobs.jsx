import { useState, useCallback } from "react";
import JOBS from "../data/jobs.js";
import JobsToolbar from "../components/jobs/JobsToolbar.jsx";
import JobBoard from "../components/jobs/JobBoard.jsx";
import JobTable from "../components/jobs/JobTable.jsx";
import JobDetail from "../components/jobs/JobDetail.jsx";
import AddJob from "../components/jobs/AddJob.jsx";

// Every application in one place. The board is the default, the table is the same data flat, and clicking either
// opens the side panel. State is local until the jobs API lands.
export default function Jobs()
  {
    const [jobs, setJobs] = useState(JOBS);
    const [view, setView] = useState("board");
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [adding, setAdding] = useState(false);
    const [freshId, setFreshId] = useState(null);

    const needle = query.trim().toLowerCase();
    const visible = needle ? jobs.filter((job) => `${job.company} ${job.role}`.toLowerCase().includes(needle)) : jobs;
    const selected = jobs.find((job) => job.id === selectedId) || null;

    const close = useCallback(() => setSelectedId(null), []);
    const setStatus = (id, status) => setJobs((list) => list.map((job) => (job.id === id ? { ...job, status } : job)));

    // New cards go to the front of their lane so you can see them land, and the search clears so they aren't hidden.
    const closeAdd = useCallback(() => setAdding(false), []);
    const addJob = (job) =>
      {
        setJobs((list) => [job, ...list]);
        setQuery("");
        // The rise plays once. Clearing the flag after it lands keeps a later drag from replaying it in the new lane.
        setFreshId(job.id);
        setTimeout(() => setFreshId(null), 600);
      };

    return (
      <div className="flex w-full flex-1 flex-col gap-5">
        <JobsToolbar view={view} onView={setView} query={query} onQuery={setQuery} total={jobs.length} onAdd={() => setAdding(true)} />

        {view === "board"
          ? <JobBoard jobs={visible} selectedId={selectedId} freshId={freshId} onOpen={setSelectedId} onMove={setStatus} />
          : <JobTable jobs={visible} selectedId={selectedId} onOpen={setSelectedId} />}

        <JobDetail job={selected} onClose={close} onStatus={setStatus} />
        <AddJob open={adding} onClose={closeAdd} onAdd={addJob} />
      </div>
    );
  }
