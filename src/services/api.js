import { faviconUrl, rootDomain, slugOf } from "../components/jobs/logos.js";

// Scaffold stubs — no live requests yet. Hook these up to http.js when ready.

export const getHealth = async () =>
  {
    throw new Error("Not wired: getHealth");
  };

// Job boards that put the company in the path instead of the hostname. The number is which path segment holds it.
const BOARD_HOSTS = { "boards.greenhouse.io": 0, "job-boards.greenhouse.io": 0, "jobs.lever.co": 0, "jobs.ashbyhq.com": 0, "apply.workable.com": 0, "jobs.smartrecruiters.com": 0 };

// Hostnames that tell you nothing about the employer. The role might still be in the path.
const AGGREGATORS = ["linkedin.com", "indeed.com", "glassdoor.com", "wellfound.com", "ycombinator.com", "simplify.jobs"];

const SKIP_WORDS = new Set(["careers", "jobs", "job", "www", "apply", "en", "us", "positions", "openings", "view", "details", "o", "p", "posting", "req"]);

const titleCase = (text) => text.split(/[-_+\s]+/).filter(Boolean).map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");

// Pulls a company and a role out of the URL alone. It's a placeholder for the real thing: the server will open the
// page and have the model read it. Until then this gets the obvious ones right so the form isn't blank.
const guessFromUrl = (url) =>
  {
    const parsed = new URL(url.includes("://") ? url : `https://${url}`);
    const host = parsed.hostname.replace(/^www\./, "");
    const segments = parsed.pathname.split("/").filter(Boolean).map(decodeURIComponent);

    let company = "";
    if(host in BOARD_HOSTS)
      {
        company = titleCase(segments[BOARD_HOSTS[host]] || "");
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
    const role = titleCase(slug.replace(/\b[0-9a-f]{6,}\b/gi, "").replace(/-\d+$/, ""));

    // The logo comes from the employer's own site when the link is on it, otherwise from a .com guess off the name.
    // The add sheet shows it as a suggestion, so a wrong guess costs one click to swap.
    const ownSite = Boolean(company) && !(host in BOARD_HOSTS) && !AGGREGATORS.some((site) => host.endsWith(site));
    const logo = ownSite ? faviconUrl(rootDomain(host)) : company ? faviconUrl(`${slugOf(company)}.com`) : "";

    return { company, role, location: "", logo, link: `${host}${parsed.pathname}`.replace(/\/$/, "") };
  };

// Reads a job posting from its link. Today it's a local guess with a pause so the UI can show the reading state;
// tomorrow it's POST /api/jobs/extract and the server does the actual scraping.
export const extractJob = async (url) =>
  {
    await new Promise((resolve) => setTimeout(resolve, 900));
    try
      {
        return guessFromUrl(url.trim());
      }
    catch
      {
        throw new Error("That doesn't look like a link.");
      }
  };
