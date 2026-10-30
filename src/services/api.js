import http from "./http.js";
import { faviconUrl, rootDomain, slugOf } from "../components/jobs/logos.js";

// Everything the client asks the server for. getHealth is still a stub.

export const getHealth = async () =>
  {
    throw new Error("Not wired: getHealth");
  };

// A failed request as one sentence to show. The server sends its own message; no reply at all means it isn't up.
export const problemOf = (error) => error.response?.data?.message || "Couldn't reach the SleekBoard server.";

// The board's jobs, saved in Mongo. Each one hands back the server's copy, so the id is always Mongo's.

// Every job, most recently touched first.
export const listJobs = async () =>
  {
    const { data } = await http.get("/jobs");
    return data;
  };

// The server ignores any id we send and makes its own, so a new card should use the one that comes back.
export const createJob = async (job) =>
  {
    const { data } = await http.post("/jobs", job);
    return data;
  };

// Send just what changed, like { status: "interviewing" } after a drag.
export const updateJob = async (id, changes) =>
  {
    const { data } = await http.patch(`/jobs/${id}`, changes);
    return data;
  };

export const deleteJob = async (id) =>
  {
    await http.delete(`/jobs/${id}`);
  };

// The contact finder. Runs happen on the server in the background: the panel starts one, then asks how it's going
// about once a second until it ends.

// A job's runs, newest first.
export const listRuns = async (jobId) =>
  {
    const { data } = await http.get("/runs", { params: { job: jobId } });
    return data;
  };

export const getRun = async (id) =>
  {
    const { data } = await http.get(`/runs/${id}`);
    return data;
  };

// "contact" looks for who to contact about the job. "note" drafts two notes to one saved contact, so it names them.
export const startRun = async (kind, jobId, contactId) =>
  {
    const { data } = await http.post("/runs", { kind, job: jobId, ...(contactId && { contact: contactId }) });
    return data;
  };

// Fill in: one AI run from a link, before the job exists. It reads the posting, fills the card and finds the contact.
export const startFill = async (link) =>
  {
    const { data } = await http.post("/runs", { kind: "fill", link });
    return data;
  };

// Add to board after Fill in: the new card becomes the run's job, so its suggested contacts can be saved for it.
export const attachRun = async (runId, jobId) =>
  {
    const { data } = await http.post(`/runs/${runId}/job`, { job: jobId });
    return data;
  };

// "accept" or "reject" on one of a finished run's suggestions. Gives back the run, the saved contact (or null) and the
// job, whose Contact field may have filled in.
export const decideSuggestion = async (runId, index, decision) =>
  {
    const { data } = await http.post(`/runs/${runId}/suggestions/${index}`, { decision });
    return data;
  };

// Who's saved for the job, and the warm leads at its company: { saved, leads: { contacts, connections,
// secondDegreeSearch } }.
export const getJobContacts = async (jobId) =>
  {
    const { data } = await http.get(`/jobs/${jobId}/contacts`);
    return data;
  };

// lead is { contact: id } for someone saved before, or { connection: id } for a LinkedIn connection.
export const takeWarmLead = async (jobId, lead) =>
  {
    const { data } = await http.post(`/jobs/${jobId}/contacts`, lead);
    return data;
  };

export const removeJobContact = async (jobId, contactId) =>
  {
    await http.delete(`/jobs/${jobId}/contacts/${contactId}`);
  };

// Your LinkedIn connections: how many are saved, upload a new Connections.csv, or forget them all.
export const getConnections = async () =>
  {
    const { data } = await http.get("/connections");
    return data;
  };

export const importConnections = async (csv) =>
  {
    const { data } = await http.put("/connections", { csv });
    return data;
  };

export const clearConnections = async () =>
  {
    await http.delete("/connections");
  };

// Job boards that put the company in the path instead of the hostname. The number is which path segment holds it.
const BOARD_HOSTS = { "boards.greenhouse.io": 0, "job-boards.greenhouse.io": 0, "jobs.lever.co": 0, "jobs.ashbyhq.com": 0, "apply.workable.com": 0, "jobs.smartrecruiters.com": 0 };

// Boards that put the company in the first label of the hostname, like nvidia.wd5.myworkdayjobs.com.
const SUBDOMAIN_BOARDS = ["myworkdayjobs.com"];

// Hostnames that tell you nothing about the employer. The role might still be in the path.
const AGGREGATORS = ["linkedin.com", "indeed.com", "glassdoor.com", "wellfound.com", "ycombinator.com", "simplify.jobs"];

const SKIP_WORDS = new Set(["careers", "jobs", "job", "www", "apply", "en", "us", "positions", "openings", "view", "details", "o", "p", "posting", "req"]);

const titleCase = (text) => text.split(/[-_+\s]+/).filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

// Pulls a company and a role out of the URL alone. The server's read of the page wins; this fills whatever it
// couldn't, and stands in completely when the site blocks the server or the API is down.
const guessFromUrl = (url) =>
  {
    const parsed = new URL(url.includes("://") ? url : `https://${url}`);
    const host = parsed.hostname.replace(/^www\./, "");
    const segments = parsed.pathname.split("/").filter(Boolean).map(decodeURIComponent);
    const subdomainBoard = SUBDOMAIN_BOARDS.some((site) => host.endsWith(`.${site}`));

    let company = "";
    if(host in BOARD_HOSTS)
      {
        company = titleCase(segments[BOARD_HOSTS[host]] || "");
      }
    else if(subdomainBoard)
      {
        company = titleCase(host.split(".")[0]);
      }
    else if(!AGGREGATORS.some((site) => host.endsWith(site)))
      {
        const parts = host.split(".");
        const base = parts.length > 2 && !SKIP_WORDS.has(parts[0]) ? parts[0] : parts[parts.length - 2] || parts[0];
        company = titleCase(base);
      }

    // The role is usually the longest wordy slug in the path. A slug counts if it has two real words in it, which
    // keeps hashed ids like "9d8f-aa12" from turning into a job title.
    const realWords = (segment) => segment.split("-").filter((word) => /^[a-z]{3,}$/i.test(word) && !/^[a-f0-9]+$/i.test(word)).length;
    const wordy = segments.filter((segment) => !SKIP_WORDS.has(segment.toLowerCase()) && realWords(segment) >= 2);
    const slug = wordy.sort((a, b) => b.length - a.length)[0] || "";
    // Requisition ids ride on the end of the slug: "-4821", or Workday's "_JR2026530".
    const role = titleCase(slug.replace(/\b[0-9a-f]{6,}\b/gi, "").replace(/_[a-z]*\d+$/i, "").replace(/-\d+$/, ""));

    // The logo comes from the employer's own site when the link is on it, otherwise from a .com guess off the name.
    // The add sheet shows it as a suggestion, so a wrong guess costs one click to swap.
    const ownSite = Boolean(company) && !(host in BOARD_HOSTS) && !subdomainBoard && !AGGREGATORS.some((site) => host.endsWith(site));
    const logo = ownSite ? faviconUrl(rootDomain(host)) : company ? faviconUrl(`${slugOf(company)}.com`) : "";

    // The query stays: some boards keep the job's id there (UKG's ?opportunityId=, Greenhouse's ?gh_jid=), and the link
    // 404s without it.
    return { company, role, location: "", logo, link: `${host}${parsed.pathname.replace(/\/$/, "")}${parsed.search}` };
  };

// Reads a job posting from its link. The server opens the page (the browser can't, other sites don't allow it) and
// sends back what it read; any field it left empty falls back to the URL guess. "via" tells the add sheet which one
// it got, and "reason" says why the server couldn't help when it couldn't.
export const extractJob = async (url) =>
  {
    let guess;
    try
      {
        guess = guessFromUrl(url.trim());
      }
    catch
      {
        throw new Error("That doesn't look like a link.");
      }

    try
      {
        const { data } = await http.post("/jobs/extract", { url: url.trim() });
        const read = { company: data.company, role: data.role, location: data.location, deadline: data.deadline, logo: data.domain ? faviconUrl(data.domain) : "" };
        const job = { ...guess };
        Object.keys(read).forEach((key) =>
          {
            if(read[key]) job[key] = read[key];
          });
        return { ...job, via: "page" };
      }
    catch(error)
      {
        return { ...guess, via: "link", reason: problemOf(error) };
      }
  };
