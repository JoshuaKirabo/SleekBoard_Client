import { useEffect, useRef, useState } from "react";
import StatusSelect from "./StatusSelect.jsx";
import { extractJob, startFill, getRun, attachRun, decideSuggestion, problemOf } from "../../services/api.js";
import { findLogos, readLogoFile, domainOfLogo, faviconUrl } from "./logos.js";
import ContactFinding from "./contacts/ContactFinding.jsx";
import { isLive } from "./contacts/useRun.js";
import { toolOf, stepTarget } from "./contacts/contactText.js";
import Roll from "./Roll.jsx";
import CompanyMark from "./CompanyMark.jsx";
import { CloseIcon, SparkleIcon, LinkIcon, CheckIcon, SearchIcon, UploadIcon } from "../icons.jsx";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

// Inputs are filled wells, not outlined boxes. The well sits a step darker than the sheet so it reads as a place to
// type without a stroke around it. Focus brightens the well instead of drawing a ring.
const well = `w-full rounded-xl bg-canvas text-ink placeholder:text-ink-3/70 transition-colors duration-150 focus:bg-board-deep focus:outline-none ${focusRing}`;
const smallWell = `${well} h-10 px-3.5 text-[13px]`;
const bigWell = `${well} h-12 px-4 text-[15px] font-medium`;

const EMPTY = { company: "", role: "", location: "", status: "saved", applied: "", deadline: "", link: "", contact: "", email: "", notes: "", logo: "" };

// The finder is closed and empty until you ask for it.
const NO_FINDER = { open: false, query: "", results: [], searching: false, searched: false };

// Small pill for the logo actions.
const chip = `flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-canvas px-3 text-[12.5px] font-medium text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink active:bg-raised disabled:cursor-default disabled:opacity-40 ${focusRing}`;

const today = () => new Date().toISOString().slice(0, 10);

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The line under the link box while Fill in's run works. Until the card is filled it's a live status: what the run is
// doing, then the page or search it's on, faded. After that it points down to Who to contact, where the search shows
// itself working. The model's own sentences are left out, they read as noise in one line.
const runNote = (run, url) =>
  {
    if(run.result?.job) return { tone: "ok", text: "Filled in the card. Check it over while we find who to contact below." };
    const step = run.steps?.findLast((each) => toolOf(each));
    if(!step) return readingNote(url);
    if(toolOf(step) === "fill_job") return { tone: "live", text: "Filling in the card", detail: "" };
    return { tone: "live", text: "Reading the listing", detail: stepTarget(step) || hostOf(url) };
  };

// What the line says when the run's done, so you know what to check.
const doneLine = (run) =>
  {
    const found = run.result?.contacts?.length || 0;
    if(!found) return "Filled in from the listing. Nobody to contact could be confirmed. Check it over.";
    return `Filled in from the listing, and found ${found === 1 ? "someone" : `${found} people`} to contact. Check it over.`;
  };

// The server's cheap first look decided the link isn't a job posting (PostingCheck). The run's error says why, and
// the sheet shows it as is instead of guessing a company and a role from the URL.
const notAJob = (run) => run.status === "failed" && String(run.error || "").startsWith("Not a job");

// The site a link is on, like boards.greenhouse.io.
const hostOf = (url) => url.trim().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];

// What the line says the moment a read goes out, naming the site so you know which page is being read.
const readingNote = (url) => ({ tone: "live", text: "Reading the listing", detail: hostOf(url) });

// The mark before the line: a pulsing dot while something is working, a check once it's done, nothing otherwise.
// Both sit in the same 14px box so the words don't jump sideways when one turns into the other.
const NoteMark = ({ tone }) =>
  {
    if(tone !== "live" && tone !== "ok") return null;
    return (
      <span aria-hidden="true" className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
        {tone === "live" ? <span className="h-1.5 w-1.5 rounded-full bg-cream motion-safe:animate-pulse" /> : <CheckIcon size={14} className="text-cream" />}
      </span>
    );
  };

// The colour of the line's words for each tone. A live line's words shimmer instead, see .shimmer-text.
const NOTE_COLOURS = { warn: "text-cream", ok: "text-ink-2", live: "text-ink-2", quiet: "text-ink-3" };

// A well the reader fills. While a read is out it's a skeleton (see .well-skeleton) and can't be typed in, and order
// is its place in the reveal once the answer lands. The skeleton sits on its own span so it never restarts: the inner
// span's key changes to replay the landed flash, and remounting the skeleton with it would cut the reveal short.
const Fillable = ({ loading, order, filled, stamp, children }) => (
  <span className="well-skeleton" data-loading={loading || undefined} inert={loading} style={{ "--k": order }}>
    <span key={filled ? stamp : "plain"} className={`block rounded-xl ${filled ? "well-landed" : ""}`}>{children}</span>
  </span>
);

// A labelled input. "filled" marks the ones the link reader wrote and flashes the well once so your eye lands on
// what to check. Pass order for a field the reader can fill, so it turns into a skeleton while a read is out.
const Field = ({ label, filled, stamp, loading = false, order, className = "", children }) => (
  <label className={`block ${className}`}>
    <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-ink-3">
      {label}
      {filled && <SparkleIcon size={11} className="text-cream" />}
    </span>
    {order === undefined
      ? <span className="block rounded-xl">{children}</span>
      : <Fillable loading={loading} order={order} filled={filled} stamp={stamp}>{children}</Fillable>}
  </label>
);

// The add flow leads with the link. Paste one and press Fill in: one AI run reads the posting, fills the card and finds
// who to contact (Josh, 2026-10-30). Everything waits here for you to check it over, and nothing reaches the board until
// Add to board. The rest is there for what it missed or for roles you only heard about.
export default function AddJob({ open, onClose, onAdd, onJobChange })
  {
    const [draft, setDraft] = useState(EMPTY);
    const [filled, setFilled] = useState([]);
    const [stamp, setStamp] = useState(0);
    const [reading, setReading] = useState(false);
    const [note, setNote] = useState(null);
    const [attempted, setAttempted] = useState(false);
    // Where the logo came from: "" for none, "auto" when we picked it, "chosen" or "upload" when you did. Only an
    // auto pick gets replaced when the company changes; a logo you chose stays put.
    const [logoSource, setLogoSource] = useState("");
    const [finder, setFinder] = useState(NO_FINDER);
    const [logoNote, setLogoNote] = useState("");
    // The save to Mongo. The sheet stays open until it lands, so a failed save keeps everything you typed.
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    // Fill in's run, and your yes or no on each contact it suggests, by its place in the list.
    const [run, setRun] = useState(null);
    const [picks, setPicks] = useState({});
    const linkInput = useRef(null);
    const fileInput = useRef(null);
    const request = useRef(0);
    const lookup = useRef(0);

    useEffect(() =>
      {
        // Closing stops following a run, so a run that finishes later can't write into the next sheet.
        request.current++;
        if(!open) return;
        setRun(null);
        setPicks({});
        setDraft(EMPTY);
        setFilled([]);
        setReading(false);
        setNote(null);
        setAttempted(false);
        setLogoSource("");
        setFinder(NO_FINDER);
        setLogoNote("");
        setSaving(false);
        setSaveError("");
        // Wait for the slide-in so the focus ring doesn't flash on the way up.
        const timer = setTimeout(() => linkInput.current?.focus(), 120);
        const onKey = (event) => event.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () =>
          {
            clearTimeout(timer);
            window.removeEventListener("keydown", onKey);
          };
      }, [open, onClose]);

    const set = (key) => (event) => setDraft((current) => ({ ...current, [key]: event.target.value }));

    const finding = !reading && isLive(run);
    // Either half of Fill in's run. The button can't be pressed then, but stays bright so it reads as working, not off.
    const busy = reading || finding;

    // Fill in. The wells stay skeletons until the run has filled the card, then the contact search carries on with its
    // steps on the line under the link. If the AI can't start (switched off, or the day's cap is used up), the plain
    // link reader fills in instead and says why.
    const read = async (url = draft.link) =>
      {
        if(!url.trim() || reading || finding) return;
        const id = ++request.current;
        setReading(true);
        setRun(null);
        setPicks({});
        setNote(readingNote(url));
        let started;
        try
          {
            started = await startFill(url.trim());
          }
        catch(error)
          {
            if(id === request.current) await plainRead(url, id, `The AI didn't start: ${problemOf(error)}`);
            return;
          }
        await follow(started, id, url);
      };

    // Asks about the run once a second until it ends, the same way a card follows its runs. The card is shown the
    // moment the run has filled it in, without waiting for the contact.
    const follow = async (first, id, url) =>
      {
        let current = first;
        let shown = false;
        while(id === request.current)
          {
            setRun(current);
            if(!shown && current.result?.job)
              {
                shown = true;
                await showJob(current.result.job, id);
              }
            if(!isLive(current)) break;
            setNote(runNote(current, url));
            await wait(1000);
            current = await getRun(current.id).catch(() => current);
          }
        if(id !== request.current) return;
        if(!shown && notAJob(current))
          {
            setReading(false);
            setNote({ tone: "warn", text: current.error });
            return;
          }
        if(!shown) return plainRead(url, id, current.error ? `The AI couldn't fill it in (${current.error}).` : "The AI couldn't read that posting.");
        setNote({ tone: "ok", text: doneLine(current) });
      };

    // The card the run filled in goes into the wells, and the skeletons lift. Fields it left empty keep whatever you
    // typed. The logo comes from the employer's site when the run knows it, or a lookup by name.
    const showJob = async (job, id) =>
      {
        const found = Object.fromEntries(["company", "role", "location", "deadline"].filter((key) => job[key]).map((key) => [key, job[key]]));
        const keepLogo = logoSource && logoSource !== "auto";
        const logo = !keepLogo && job.domain ? faviconUrl(job.domain) : "";
        setDraft((current) => ({ ...current, ...found, ...(logo && { logo }) }));
        if(logo)
          {
            setLogoSource("auto");
            setLogoNote(`From ${job.domain}`);
          }
        setFilled([...Object.keys(found), ...(logo ? ["logo"] : [])]);
        setStamp(id);
        setReading(false);
        if(!logo && !keepLogo && job.company) await lookUpLogo(job.company, id);
      };

    const lookUpLogo = async (company, id) =>
      {
        const [hit] = await findLogos(company);
        if(!hit || id !== request.current) return;
        setDraft((current) => ({ ...current, logo: hit.url }));
        setLogoSource("auto");
        setLogoNote(`From ${hit.domain}`);
      };

    // The plain link reader, without the AI. why says why the AI didn't do it.
    const plainRead = async (url, id, why = "") =>
      {
        const lead = why ? `${why} ` : "";
        try
          {
            const { via, reason, ...found } = await extractJob(url);
            if(id !== request.current) return;
            const keys = Object.keys(found).filter((key) => found[key] && key !== "link");
            // A logo you picked yourself outranks the reader's guess.
            const keepLogo = logoSource && logoSource !== "auto";
            // The link box keeps what you pasted. The reader's tidied copy once replaced it, and a second Fill in then read
            // the tidied link (problem #36).
            setDraft((current) => ({ ...current, ...found, link: current.link, applied: current.applied, status: current.status, logo: keepLogo ? current.logo : found.logo || current.logo }));
            if(found.logo && !keepLogo)
              {
                setLogoSource("auto");
                setLogoNote(`From ${domainOfLogo(found.logo) || "the listing"}`);
              }
            setFilled(keepLogo ? keys.filter((key) => key !== "logo") : keys);
            setStamp(id);
            // Say whether we read the page or only guessed from the link, so you know how far to trust it.
            const host = found.link.split("/")[0];
            if(!keys.length) setNote({ tone: "quiet", text: `${lead}Couldn't tell much from that link. Fill it in by hand.` });
            else if(via === "page") setNote({ tone: "ok", text: `${lead}Read the listing on ${host}. Check it over.` });
            else setNote({ tone: "quiet", text: `${lead}${reason} Guessed what we could from the link.` });
          }
        catch(error)
          {
            if(id !== request.current) return;
            setNote({ tone: "warn", text: error.message });
          }
        finally
          {
            if(id === request.current) setReading(false);
          }
      };

    // Your yes or no on a suggested contact, saved with the job once you add it. The server then fills the job's own
    // contact and email from them (JobCard.js), so the sheet has no boxes for those.
    const answerContact = (index, contact, decision) => setPicks((current) => ({ ...current, [index]: decision }));

    // After Add to board: the new card becomes the run's job, and the contacts you said yes to are saved for it, the
    // same way as saving them from the card. The job's already on the board by now, so a hiccup here only means the
    // card shows the suggestions instead, still unanswered.
    const keepContacts = async (job) =>
      {
        if(!run || !job) return;
        try
          {
            await attachRun(run.id, job.id);
            for(const [index, decision] of Object.entries(picks))
              {
                const answer = await decideSuggestion(run.id, Number(index), decision);
                if(answer.job) onJobChange?.(answer.job);
              }
          }
        catch(error)
          {
            console.error("Couldn't save the picked contacts with the job:", problemOf(error));
          }
      };

    // Reading only runs when you ask: the Fill in button, or Enter in the link box. Every read sends the server off to
    // open someone else's page, so a paste (or a paste you then fix) shouldn't fire one by itself.
    const onLinkKey = (event) =>
      {
        if(event.key !== "Enter") return;
        event.preventDefault();
        read();
      };

    // Your own pick. Cancels any lookup in flight and drops the reader's sparkle, since it's no longer the reader's.
    const setLogo = (logo, source, text = "") =>
      {
        lookup.current++;
        setDraft((current) => ({ ...current, logo }));
        setLogoSource(logo ? source : "");
        setLogoNote(text);
        setFilled((current) => current.filter((key) => key !== "logo"));
      };

    // Leaving the company field with no logo of your own kicks off a quiet lookup. The first domain that answers wins.
    const guessLogo = async () =>
      {
        const name = draft.company.trim();
        if(!name || (logoSource && logoSource !== "auto")) return;
        const id = ++lookup.current;
        const [hit] = await findLogos(name);
        if(id !== lookup.current) return;
        if(hit)
          {
            setDraft((current) => ({ ...current, logo: hit.url }));
            setLogoSource("auto");
            setLogoNote(`From ${hit.domain}`);
          }
        else if(logoSource === "auto")
          {
            setDraft((current) => ({ ...current, logo: "" }));
            setLogoSource("");
            setLogoNote("");
          }
      };

    const openFinder = () => setFinder({ ...NO_FINDER, open: true, query: draft.company.trim() });

    const search = async (event) =>
      {
        event?.preventDefault();
        const query = finder.query.trim();
        if(!query || finder.searching) return;
        setFinder((current) => ({ ...current, searching: true, searched: false }));
        const results = await findLogos(query);
        setFinder((current) => (current.open ? { ...current, results, searching: false, searched: true } : current));
      };

    const pick = (hit) =>
      {
        setLogo(hit.url, "chosen", `From ${hit.domain}`);
        setFinder(NO_FINDER);
      };

    const upload = async (file) =>
      {
        if(!file) return;
        try
          {
            setLogo(await readLogoFile(file), "upload", file.name);
            setFinder(NO_FINDER);
          }
        catch(error)
          {
            setLogoNote(error.message);
          }
      };

    const onDrop = (event) =>
      {
        event.preventDefault();
        upload(event.dataTransfer.files?.[0]);
      };

    const valid = draft.company.trim() && draft.role.trim();

    // Mongo hands out the id, so the job goes up without one and the card appears once the server answers.
    const submit = async (event) =>
      {
        event.preventDefault();
        setAttempted(true);
        if(!valid || saving) return;
        const applied = draft.status !== "saved" && !draft.applied ? today() : draft.applied;
        const link = draft.link.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
        setSaving(true);
        setSaveError("");
        try
          {
            const job = await onAdd({ ...draft, applied, link, logo: draft.logo || "", company: draft.company.trim(), role: draft.role.trim() });
            await keepContacts(job);
            onClose();
          }
        catch(error)
          {
            setSaveError(error.message);
          }
        finally
          {
            setSaving(false);
          }
      };

    const missing = (key) => attempted && !draft[key].trim();
    const rise = open ? "rise" : "";

    return (
      <div aria-hidden={!open} className={`fixed inset-0 z-40 flex items-end justify-center sm:items-center ${open ? "" : "pointer-events-none"}`}>
        <div onClick={onClose} className={`absolute inset-0 bg-black/60 transition-opacity ease-out-strong ${open ? "opacity-100 duration-300" : "opacity-0 duration-200"}`} aria-hidden="true" />

        {/* Tailwind v4 puts translate, scale and rotate on their own CSS properties, so those are what gets transitioned,
            not "transform". Listing transform here would make the slide and shrink snap. */}
        <form
          onSubmit={submit}
          noValidate
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-job-title"
          className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-surface shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] transition-[translate,scale,opacity] ease-out-strong sm:w-[580px] sm:rounded-[28px] ${open ? "translate-y-0 scale-100 opacity-100 duration-[420ms]" : "translate-y-6 scale-[0.97] opacity-0 duration-[260ms]"}`}
        >
          <div className={`flex items-center justify-between px-7 pt-6 ${rise}`} style={{ "--i": 0 }}>
            <h2 id="add-job-title" className="text-[26px] leading-none font-bold tracking-[-0.02em]">Add a job</h2>
            <button type="button" onClick={onClose} className={`-mr-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink-2 transition-[color,rotate,scale] duration-300 ease-out-strong hover:scale-110 hover:rotate-90 hover:text-ink active:scale-90 active:duration-100 ${focusRing}`} aria-label="Close">
              <CloseIcon size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-7 pt-6 pb-7">
            {/* The link box is the hero: taller and brighter than everything under it. */}
            <div className={`relative ${rise}`} style={{ "--i": 1 }}>
              <LinkIcon size={17} className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-ink-3" />
              <input
                ref={linkInput}
                type="url"
                value={draft.link}
                onChange={set("link")}
                onKeyDown={onLinkKey}
                placeholder="Paste the job link"
                autoComplete="off"
                className={`h-14 w-full rounded-2xl bg-canvas pr-28 pl-12 text-[15px] font-medium text-ink placeholder:text-ink-3/70 transition-colors duration-150 focus:bg-board-deep focus:outline-none ${focusRing}`}
              />
              <button
                type="button"
                onClick={() => read()}
                disabled={!draft.link.trim() || busy}
                aria-busy={busy}
                className={`absolute top-1/2 right-2 flex h-10 -translate-y-1/2 cursor-pointer items-center gap-1.5 rounded-xl bg-cream px-3.5 text-[13px] font-semibold text-canvas transition-[opacity,scale] duration-100 enabled:hover:opacity-90 enabled:active:scale-[0.97] ${busy ? "cursor-progress" : "disabled:cursor-default disabled:opacity-30"} ${focusRing}`}
              >
                <SparkleIcon size={14} className={busy ? "motion-safe:animate-pulse" : ""} />
                {reading ? "Reading" : finding ? "Finding contacts" : "Fill In"}
              </button>
            </div>

            {/* The status line. While a read is out: a pulsing dot, what it's doing in shimmering words, then the page or
                search it's on, faded and cut to one line. Each part rolls on its own when it changes. */}
            <p aria-live="polite" style={{ "--i": 2 }} className={`mt-2.5 flex min-h-5 items-center gap-1.5 text-[13px] leading-5 ${rise} ${NOTE_COLOURS[note?.tone] || "text-ink-3"}`}>
              <NoteMark tone={note?.tone} />
              <Roll text={note ? note.text : "Or fill it in yourself below."} className="min-w-0" lineClass={note?.tone === "live" ? "shimmer-text font-medium" : ""} />
              <Roll text={note?.tone === "live" && note.detail ? `· ${note.detail}` : ""} className="roll-truncate min-w-0 flex-1 text-ink-3" />
            </p>

            {/* The logo row. The tile is a live preview: it shows the reader's guess, what you found, or what you dropped on it,
                and falls back to the company's first letter. Drop an image on the tile or use the two chips. */}
            <div style={{ "--i": 3 }} aria-busy={reading} className={`mt-6 ${rise}`}>
              <div className="flex items-center gap-4">
                <span onDrop={onDrop} onDragOver={(event) => event.preventDefault()} className="block shrink-0">
                  <Fillable loading={reading} order={0} filled={filled.includes("logo")} stamp={stamp}>
                    <CompanyMark name={draft.company} logo={draft.logo || null} size="h-14 w-14 text-[22px]" radius="rounded-xl" fallback="bg-canvas" />
                  </Fillable>
                </span>
                <div className={`min-w-0 flex-1 transition-opacity duration-200 ${reading ? "opacity-50" : "opacity-100"}`}>
                  <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink-3">
                    Logo
                    {filled.includes("logo") && <SparkleIcon size={11} className="text-cream" />}
                  </span>
                  <p className="mt-0.5 truncate text-[13px] text-ink-2">
                    {logoNote || (draft.company.trim() ? "We'll look one up from the company name." : "Found from the link, or add your own.")}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <button type="button" onClick={finder.open ? () => setFinder(NO_FINDER) : openFinder} aria-expanded={finder.open} className={`${chip} ${finder.open ? "bg-raised text-ink" : ""}`}>
                      <SearchIcon size={13} />
                      Find
                    </button>
                    <button type="button" onClick={() => fileInput.current?.click()} className={chip}>
                      <UploadIcon size={13} />
                      Upload
                    </button>
                    {draft.logo && (
                      <button type="button" onClick={() => setLogo("", "")} className={`${chip} bg-transparent`}>
                        Remove
                      </button>
                    )}
                    <input ref={fileInput} type="file" accept="image/*" onChange={(event) => { upload(event.target.files?.[0]); event.target.value = ""; }} className="hidden" tabIndex={-1} />
                  </div>
                </div>
              </div>

              {finder.open && (
                <div className="mt-3 rounded-2xl bg-canvas/60 p-3">
                  <div className="relative">
                    <SearchIcon size={15} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-ink-3" />
                    <input
                      type="text"
                      value={finder.query}
                      onChange={(event) => setFinder((current) => ({ ...current, query: event.target.value }))}
                      onKeyDown={(event) => event.key === "Enter" && search(event)}
                      placeholder="Company name or website"
                      autoFocus
                      autoComplete="off"
                      className={`${smallWell} pr-20 pl-10`}
                    />
                    <button type="button" onClick={search} disabled={!finder.query.trim() || finder.searching} className={`absolute top-1/2 right-1.5 h-7 -translate-y-1/2 cursor-pointer rounded-lg bg-raised px-2.5 text-[12px] font-semibold text-ink transition-opacity duration-100 hover:opacity-90 disabled:cursor-default disabled:opacity-40 ${focusRing}`}>
                      {finder.searching ? "Looking" : "Search"}
                    </button>
                  </div>

                  {finder.results.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {finder.results.map((hit) => (
                        <button key={hit.domain} type="button" onClick={() => pick(hit)} className={`flex cursor-pointer flex-col items-center gap-1.5 rounded-xl p-2 transition-colors duration-150 hover:bg-raised ${focusRing}`}>
                          <CompanyMark name={hit.domain} logo={hit.url} size="h-12 w-12 text-[18px]" radius="rounded-xl" />
                          <span className="max-w-20 truncate text-[11px] text-ink-3">{hit.domain}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {finder.searched && finder.results.length === 0 && (
                    <p className="mt-3 text-[12.5px] text-ink-3">Nothing on the usual domains. Try the website address, or upload one.</p>
                  )}
                </div>
              )}
            </div>

            {/* Company and role are the two that matter, so they get the big wells. The rest sit smaller underneath. */}
            <div style={{ "--i": 4 }} aria-busy={reading} className={`mt-5 grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 ${rise}`}>
              <Field label="Company" filled={filled.includes("company")} stamp={stamp} loading={reading} order={1}>
                <input type="text" value={draft.company} onChange={set("company")} onBlur={guessLogo} placeholder="Stripe" className={`${bigWell} ${missing("company") ? "ring-2 ring-cream/60 ring-inset" : ""}`} aria-invalid={missing("company")} />
              </Field>
              <Field label="Role" filled={filled.includes("role")} stamp={stamp} loading={reading} order={2}>
                <input type="text" value={draft.role} onChange={set("role")} placeholder="Frontend Engineer" className={`${bigWell} ${missing("role") ? "ring-2 ring-cream/60 ring-inset" : ""}`} aria-invalid={missing("role")} />
              </Field>
              <Field label="Location" filled={filled.includes("location")} stamp={stamp} loading={reading} order={3}>
                <input type="text" value={draft.location} onChange={set("location")} placeholder="Remote" className={smallWell} />
              </Field>
              <Field label="Deadline" filled={filled.includes("deadline")} stamp={stamp} loading={reading} order={4}>
                <input type="date" value={draft.deadline} onChange={set("deadline")} className={`${smallWell} tabular-nums`} />
              </Field>
            </div>

            {/* Who to contact shows up the moment the run fills the card, so the search has somewhere to be seen working.
                Saying yes to someone here saves them with the job once you add it. */}
            {run?.result?.job && <ContactFinding run={run} picks={picks} onAnswer={answerContact} />}

            {/* Status is a dropdown in the same grid. Once it leaves "To Apply" the applied date opens up beside it. */}
            <div className={`mt-5 grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 ${rise}`} style={{ "--i": 5 }}>
              <div>
                <span className="mb-1.5 block text-[12px] font-medium text-ink-3">Status</span>
                <StatusSelect value={draft.status} onChange={(status) => setDraft((current) => ({ ...current, status }))} />
              </div>
              {draft.status !== "saved" && (
                <div>
                  <Field label="Applied on">
                    <input type="date" value={draft.applied} onChange={set("applied")} className={`${smallWell} tabular-nums`} />
                  </Field>
                  <p className="mt-1.5 text-[12px] text-ink-3">Leave it blank for today.</p>
                </div>
              )}
            </div>

            <div className={`mt-6 ${rise}`} style={{ "--i": 6 }}>
              <Field label="Notes">
                <textarea value={draft.notes} onChange={set("notes")} rows={3} placeholder="Anything worth remembering from the listing or the recruiter." className={`${smallWell} h-auto resize-none py-3 leading-relaxed`} />
              </Field>
            </div>
          </div>

          <div className={`flex items-center justify-end gap-3 px-7 pb-6 ${rise}`} style={{ "--i": 7 }}>
            {attempted && !valid && <p className="mr-auto text-[12px] text-cream">Company and role are the minimum.</p>}
            {valid && saveError && <p aria-live="polite" className="mr-auto text-[12px] text-cream">{saveError}</p>}
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={onClose} className={`h-11 cursor-pointer rounded-full px-4 text-[13px] font-medium text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink ${focusRing}`}>
                Cancel
              </button>
              <button type="submit" disabled={saving} className={`h-11 cursor-pointer rounded-full bg-ink px-5 text-[14px] font-semibold text-canvas transition-[opacity,transform] duration-100 hover:opacity-90 active:scale-[0.97] disabled:cursor-default disabled:opacity-60 ${focusRing} focus-visible:outline-ink`}>
                {saving ? "Adding…" : "Add to board"}
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
