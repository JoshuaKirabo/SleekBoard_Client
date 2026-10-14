import { useEffect, useRef, useState } from "react";
import { STATUSES } from "./statuses.js";
import { extractJob } from "../../services/api.js";
import { CloseIcon, SparkleIcon, LinkIcon, CheckIcon } from "../icons.jsx";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

// Inputs are filled wells, not outlined boxes. The well sits a step darker than the sheet so it reads as a place to
// type without a stroke around it. Focus brightens the well instead of drawing a ring.
const well = `w-full rounded-xl bg-canvas text-ink placeholder:text-ink-3/70 transition-colors duration-150 focus:bg-board-deep focus:outline-none ${focusRing}`;
const smallWell = `${well} h-10 px-3.5 text-[13px]`;
const bigWell = `${well} h-12 px-4 text-[15px] font-medium`;

const EMPTY = { company: "", role: "", location: "", status: "saved", applied: "", deadline: "", link: "", contact: "", email: "", notes: "" };

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
    const linkInput = useRef(null);
    const request = useRef(0);

    useEffect(() =>
      {
        if(!open) return;
        setDraft(EMPTY);
        setFilled([]);
        setReading(false);
        setNote(null);
        setAttempted(false);
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
            setDraft((current) => ({ ...current, ...found, applied: current.applied, status: current.status }));
            setFilled(keys);
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

    const valid = draft.company.trim() && draft.role.trim();

    const submit = (event) =>
      {
        event.preventDefault();
        setAttempted(true);
        if(!valid) return;
        const applied = draft.status !== "saved" && !draft.applied ? today() : draft.applied;
        const link = draft.link.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
        onAdd({ ...draft, applied, link, company: draft.company.trim(), role: draft.role.trim(), id: `j${Date.now()}` });
        onClose();
      };

    const missing = (key) => attempted && !draft[key].trim();
    const rise = open ? "rise" : "";

    return (
      <div aria-hidden={!open} className={`fixed inset-0 z-40 flex items-end justify-center sm:items-center ${open ? "" : "pointer-events-none"}`}>
        <div onClick={onClose} className={`absolute inset-0 bg-black/60 transition-opacity ease-out-strong ${open ? "opacity-100 duration-300" : "opacity-0 duration-200"}`} aria-hidden="true" />

        <form
          onSubmit={submit}
          noValidate
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-job-title"
          className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] bg-surface shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] transition-[transform,opacity] ease-out-strong sm:w-[580px] sm:rounded-[28px] ${open ? "translate-y-0 scale-100 opacity-100 duration-[420ms]" : "translate-y-4 scale-[0.96] opacity-0 duration-200"}`}
        >
          <div className={`flex items-center justify-between px-7 pt-6 ${rise}`} style={{ "--i": 0 }}>
            <h2 id="add-job-title" className="text-[26px] leading-none font-bold tracking-[-0.02em]">Add a job</h2>
            <button type="button" onClick={onClose} className={`-mr-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink-2 transition-[color,transform] duration-300 ease-out-strong hover:scale-110 hover:rotate-90 hover:text-ink active:scale-90 active:duration-100 ${focusRing}`} aria-label="Close">
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

            {/* Company and role are the two that matter, so they get the big wells. The rest sit smaller underneath. */}
            <div style={{ "--i": 3 }} className={`mt-6 grid grid-cols-1 gap-x-4 gap-y-5 transition-opacity duration-200 sm:grid-cols-2 ${rise} ${reading ? "opacity-50" : "opacity-100"}`}>
              <Field label="Company" filled={filled.includes("company")} stamp={stamp}>
                <input type="text" value={draft.company} onChange={set("company")} placeholder="Stripe" className={`${bigWell} ${missing("company") ? "ring-2 ring-cream/60 ring-inset" : ""}`} aria-invalid={missing("company")} />
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

            <div className={`mt-6 ${rise}`} style={{ "--i": 4 }} role="radiogroup" aria-label="Status">
              <span className="mb-2 block text-[12px] font-medium text-ink-3">Status</span>
              <div className="flex flex-wrap gap-1">
                {STATUSES.map((status) => {
                  const active = status.id === draft.status;
                  return (
                    <button
                      key={status.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setDraft((current) => ({ ...current, status: status.id }))}
                      className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-[12.5px] font-medium transition-colors duration-150 ${focusRing} ${active ? "bg-ink text-canvas" : "bg-canvas text-ink-2 hover:bg-raised hover:text-ink active:bg-raised"}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-canvas" : status.dot}`} aria-hidden="true" />
                      {status.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {draft.status !== "saved" && (
              <div className="mt-5 sm:w-[calc(50%-8px)]">
                <Field label="Applied on">
                  <input type="date" value={draft.applied} onChange={set("applied")} className={`${smallWell} tabular-nums`} />
                </Field>
                <p className="mt-1.5 text-[12px] text-ink-3">Leave it blank for today.</p>
              </div>
            )}

            <div className={`mt-6 ${rise}`} style={{ "--i": 5 }}>
              <Field label="Notes">
                <textarea value={draft.notes} onChange={set("notes")} rows={3} placeholder="Anything worth remembering from the listing or the recruiter." className={`${smallWell} h-auto resize-none py-3 leading-relaxed`} />
              </Field>
            </div>
          </div>

          <div className={`flex items-center justify-end gap-3 px-7 pb-6 ${rise}`} style={{ "--i": 6 }}>
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
