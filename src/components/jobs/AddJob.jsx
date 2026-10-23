import { useEffect, useRef, useState } from "react";
import StatusSelect from "./StatusSelect.jsx";
import { extractJob } from "../../services/api.js";
import { findLogos, readLogoFile, domainOfLogo } from "./logos.js";
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

// A labelled input. "filled" marks the ones the link reader wrote and flashes the well once so your eye lands on
// what to check. The key on the span restarts the flash if the same field gets filled again.
const Field = ({ label, filled, stamp, className = "", children }) => (
  <label className={`block ${className}`}>
    <span className="mb-1.5 flex items-center gap-1.5 text-[12px] font-medium text-ink-3">
      {label}
      {filled && <SparkleIcon size={11} className="text-cream" />}
    </span>
    <span key={filled ? stamp : "plain"} className={`block rounded-xl ${filled ? "well-landed" : ""}`}>{children}</span>
  </label>
);

// The add flow leads with the link. Paste one, the reader fills what it can, and the rest of the form is there for
// what it missed or for roles you only heard about. Today the reader is a local guess; the server takes it over
// without this file changing, see extractJob.
export default function AddJob({ open, onClose, onAdd })
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
    const linkInput = useRef(null);
    const fileInput = useRef(null);
    const request = useRef(0);
    const lookup = useRef(0);

    useEffect(() =>
      {
        if(!open) return;
        setDraft(EMPTY);
        setFilled([]);
        setReading(false);
        setNote(null);
        setAttempted(false);
        setLogoSource("");
        setFinder(NO_FINDER);
        setLogoNote("");
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

    const read = async (url = draft.link) =>
      {
        if(!url.trim() || reading) return;
        const id = ++request.current;
        setReading(true);
        setNote({ tone: "quiet", text: "Reading the listing…" });
        try
          {
            const found = await extractJob(url);
            if(id !== request.current) return;
            const keys = Object.keys(found).filter((key) => found[key] && key !== "link");
            // A logo you picked yourself outranks the reader's guess.
            const keepLogo = logoSource && logoSource !== "auto";
            setDraft((current) => ({ ...current, ...found, applied: current.applied, status: current.status, logo: keepLogo ? current.logo : found.logo || current.logo }));
            if(found.logo && !keepLogo)
              {
                setLogoSource("auto");
                setLogoNote(`From ${domainOfLogo(found.logo) || "the listing"}`);
              }
            setFilled(keepLogo ? keys.filter((key) => key !== "logo") : keys);
            setStamp(id);
            setNote(keys.length ? { tone: "ok", text: `Filled from ${found.link.split("/")[0]}. Check it over.` } : { tone: "quiet", text: "Couldn't tell much from that link. Fill it in by hand." });
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

    // Pasting a link is the whole point, so it reads straight away without a second click.
    const onPaste = (event) =>
      {
        const text = event.clipboardData.getData("text").trim();
        if(!/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}/i.test(text)) return;
        event.preventDefault();
        setDraft((current) => ({ ...current, link: text }));
        read(text);
      };

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

    const submit = (event) =>
      {
        event.preventDefault();
        setAttempted(true);
        if(!valid) return;
        const applied = draft.status !== "saved" && !draft.applied ? today() : draft.applied;
        const link = draft.link.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
        onAdd({ ...draft, applied, link, logo: draft.logo || "", company: draft.company.trim(), role: draft.role.trim(), id: `j${Date.now()}` });
        onClose();
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
                onPaste={onPaste}
                onKeyDown={onLinkKey}
                placeholder="Paste the job link"
                autoComplete="off"
                className={`h-14 w-full rounded-2xl bg-canvas pr-28 pl-12 text-[15px] font-medium text-ink placeholder:text-ink-3/70 transition-colors duration-150 focus:bg-board-deep focus:outline-none ${focusRing}`}
              />
              <button
                type="button"
                onClick={() => read()}
                disabled={!draft.link.trim() || reading}
                className={`absolute top-1/2 right-2 flex h-10 -translate-y-1/2 cursor-pointer items-center gap-1.5 rounded-xl bg-cream px-3.5 text-[13px] font-semibold text-canvas transition-[opacity,transform] duration-100 hover:opacity-90 active:scale-[0.97] disabled:cursor-default disabled:opacity-30 ${focusRing}`}
              >
                <SparkleIcon size={14} />
                {reading ? "Reading" : "Fill in"}
              </button>
              <span aria-hidden="true" className={`absolute right-5 bottom-0 left-5 h-[3px] origin-left rounded-full bg-cream transition-transform ease-out ${reading ? "scale-x-100 duration-[900ms]" : "scale-x-0 duration-200"}`} />
            </div>

            <p aria-live="polite" style={{ "--i": 2 }} className={`mt-2.5 flex min-h-5 items-center gap-1.5 text-[13px] ${rise} ${note?.tone === "warn" ? "text-cream" : note?.tone === "ok" ? "text-ink-2" : "text-ink-3"}`}>
              {note?.tone === "ok" && <CheckIcon size={14} className="text-cream" />}
              {note ? note.text : "Or fill it in yourself below."}
            </p>

            {/* The logo row. The tile is a live preview: it shows the reader's guess, what you found, or what you dropped on it,
                and falls back to the company's first letter. Drop an image on the tile or use the two chips. */}
            <div style={{ "--i": 3 }} className={`mt-6 ${rise} transition-opacity duration-200 ${reading ? "opacity-50" : "opacity-100"}`}>
              <div className="flex items-center gap-4">
                <span key={filled.includes("logo") ? stamp : "plain"} onDrop={onDrop} onDragOver={(event) => event.preventDefault()} className={`block rounded-xl ${filled.includes("logo") ? "well-landed" : ""}`}>
                  <CompanyMark name={draft.company} logo={draft.logo || null} size="h-14 w-14 text-[22px]" radius="rounded-xl" fallback="bg-canvas" />
                </span>
                <div className="min-w-0 flex-1">
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
            <div style={{ "--i": 4 }} className={`mt-5 grid grid-cols-1 gap-x-4 gap-y-5 transition-opacity duration-200 sm:grid-cols-2 ${rise} ${reading ? "opacity-50" : "opacity-100"}`}>
              <Field label="Company" filled={filled.includes("company")} stamp={stamp}>
                <input type="text" value={draft.company} onChange={set("company")} onBlur={guessLogo} placeholder="Stripe" className={`${bigWell} ${missing("company") ? "ring-2 ring-cream/60 ring-inset" : ""}`} aria-invalid={missing("company")} />
              </Field>
              <Field label="Role" filled={filled.includes("role")} stamp={stamp}>
                <input type="text" value={draft.role} onChange={set("role")} placeholder="Frontend Engineer" className={`${bigWell} ${missing("role") ? "ring-2 ring-cream/60 ring-inset" : ""}`} aria-invalid={missing("role")} />
              </Field>
              <Field label="Location" filled={filled.includes("location")} stamp={stamp}>
                <input type="text" value={draft.location} onChange={set("location")} placeholder="Remote" className={smallWell} />
              </Field>
              <Field label="Deadline">
                <input type="date" value={draft.deadline} onChange={set("deadline")} className={`${smallWell} tabular-nums`} />
              </Field>
              <Field label="Contact">
                <input type="text" value={draft.contact} onChange={set("contact")} placeholder="Recruiter's name" className={smallWell} />
              </Field>
              <Field label="Email">
                <input type="email" value={draft.email} onChange={set("email")} placeholder="name@company.com" className={smallWell} />
              </Field>
            </div>

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
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={onClose} className={`h-11 cursor-pointer rounded-full px-4 text-[13px] font-medium text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink ${focusRing}`}>
                Cancel
              </button>
              <button type="submit" className={`h-11 cursor-pointer rounded-full bg-ink px-5 text-[14px] font-semibold text-canvas transition-[opacity,transform] duration-100 hover:opacity-90 active:scale-[0.97] ${focusRing} focus-visible:outline-ink`}>
                Add to board
              </button>
            </div>
          </div>
        </form>
      </div>
    );
  }
