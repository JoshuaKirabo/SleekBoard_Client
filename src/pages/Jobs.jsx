import { useState, useCallback } from "react";
import JOBS from "../data/jobs.js";
import JobsToolbar from "../components/jobs/JobsToolbar.jsx";
import JobBoard from "../components/jobs/JobBoard.jsx";
import JobTable from "../components/jobs/JobTable.jsx";
import JobDetail from "../components/jobs/JobDetail.jsx";

// Every application in one place. The board is the default, the table is the same data flat, and clicking either
// opens the side panel. State is local until the jobs API lands.
export default function Jobs()
  {
    const [jobs, setJobs] = useState(JOBS);
    const [view, setView] = useState("board");
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState(null);

    const needle = query.trim().toLowerCase();
    const visible = needle ? jobs.filter((job) => `${job.company} ${job.role}`.toLowerCase().includes(needle)) : jobs;
    const selected = jobs.find((job) => job.id === selectedId) || null;

    const close = useCallback(() => setSelectedId(null), []);
    const setStatus = (id, status) => setJobs((list) => list.map((job) => (job.id === id ? { ...job, status } : job)));

    return (
      <div className="flex w-full flex-1 flex-col gap-5">
        <JobsToolbar view={view} onView={setView} query={query} onQuery={setQuery} total={jobs.length} />

        {view === "board"
          ? <JobBoard jobs={visible} selectedId={selectedId} onOpen={setSelectedId} onMove={setStatus} />
          : <JobTable jobs={visible} selectedId={selectedId} onOpen={setSelectedId} />}

        <JobDetail job={selected} onClose={close} onStatus={setStatus} />
      </div>
    );
  }
