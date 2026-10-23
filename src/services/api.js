import http from "./http.js";
import { faviconUrl, rootDomain, slugOf } from "../components/jobs/logos.js";

// Scaffold stubs — no live requests yet. Hook these up to http.js when ready.

export const getHealth = async () =>
  {
    throw new Error("Not wired: getHealth");
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

    return { company, role, location: "", logo, link: `${host}${parsed.pathname}`.replace(/\/$/, "") };
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
        const reason = error.response?.data?.message || "Couldn't reach the SleekBoard server.";
        return { ...guess, via: "link", reason };
      }
  };
