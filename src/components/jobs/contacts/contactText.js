// Small helpers for showing contacts and runs in plain words.

export const KIND_LABELS = { hiring_manager: "Hiring manager", recruiter: "Recruiter", alumni: "Your school", peer: "On the team", interviewer: "Interviewer", internal_referral: "Knows you", other: "Contact" };

// A link we're happy to make clickable: http or https only. Anything else (javascript:, data:) shows as plain text.
// A link with no scheme, like linkedin.com/in/sam, gets https in front.
export const safeHref = (link) =>
  {
    const text = String(link || "").trim();
    if(!text) return "";
    try
      {
        const url = new URL(text.includes("://") ? text : `https://${text}`);
        return ["http:", "https:"].includes(url.protocol) ? url.href : "";
      }
    catch
      {
        return "";
      }
  };

// linkedin.com/in/sam instead of https://www.linkedin.com/in/sam/.
export const shortLink = (link) => String(link || "").replace(/^[a-z]+:\/\//i, "").replace(/^www\./, "").replace(/\/$/, "");

// The finder's closing note without the Markdown bold marks models like to add.
export const plainNote = (text) => String(text || "").replace(/\*\*|__/g, "");

// Cents with one decimal, since a run costs one or two.
export const cents = (dollars) => `${((dollars || 0) * 100).toFixed(1)}¢`;

// How long a run took, or has taken so far.
export const elapsed = (run) =>
  {
    if(!run?.startedAt) return "";
    const end = run.finishedAt ? new Date(run.finishedAt) : new Date();
    return `${Math.max(0, Math.round((end - new Date(run.startedAt)) / 1000))}s`;
  };

// "12 Mar 2024" from "2024-03-12".
export const shortDate = (day) =>
  {
    if(!day) return "";
    const date = new Date(`${day.slice(0, 10)}T00:00:00`);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

// The log saves a tool call as its name and its arguments, like web_search {"query":"Stripe recruiter"}, cut at 300
// characters, so the JSON can be broken. This pulls out the one part worth showing.
const argOf = (args, key) =>
  {
    const found = new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)`).exec(args);
    return found ? found[1].replace(/\\"/g, "\"") : "";
  };

const TOOL_LINES =
  {
    web_search: (args) => `Searched “${argOf(args, "query")}”`,
    read_page: (args) => `Read ${shortLink(argOf(args, "url"))}`,
    suggest_contact: (args) => `Suggested ${argOf(args, "name") || "someone"}`,
    save_notes: () => "Wrote the notes",
    fill_job: () => "Filled in the card",
  };

// One log step as a line to show: what the model said, a tool it used, or a tool that broke.
export const stepLine = (step) =>
  {
    if(step.type !== "tool") return step.text;
    const space = step.text.indexOf(" ");
    const name = space === -1 ? step.text : step.text.slice(0, space);
    const line = TOOL_LINES[name];
    return line ? line(step.text.slice(space + 1)) : step.text;
  };
