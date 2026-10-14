import { useEffect } from "react";
import { STATUSES, longDate } from "./statuses.js";
import CompanyMark from "./CompanyMark.jsx";
import { CloseIcon, ArrowUpRightIcon, PinIcon, CalendarIcon, LinkIcon, PersonIcon, MailIcon } from "../icons.jsx";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

const Row = ({ Icon, label, children }) => (
  <div className="flex items-start gap-3 py-2">
    <Icon size={15} className="mt-0.5 shrink-0 text-ink-3" />
    <dt className="w-24 shrink-0 text-[12px] text-ink-3">{label}</dt>
    <dd className="min-w-0 flex-1 text-[13px] text-ink">{children || <span className="text-ink-3">Not set</span>}</dd>
  </div>
);

// Side panel for one application. Slides in from the right and leaves the same way. It is a frosted layer over the
// page rather than a modal, so you can still see the board behind it while you read.
export default function JobDetail({ job, onClose, onStatus })
  {
    const open = Boolean(job);

    useEffect(() =>
      {
        if(!open) return;
        const onKey = (event) => event.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
      }, [open, onClose]);

    return (
      <aside
        aria-label="Application details"
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-30 flex w-full flex-col bg-surface/90 shadow-[-32px_0_64px_-32px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:w-[560px] lg:w-[700px] ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {job && (
          <>
            <div className="flex h-[76px] shrink-0 items-center justify-between px-5">
              <button type="button" onClick={onClose} className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink ${focusRing}`} aria-label="Close details">
                <CloseIcon size={16} />
              </button>
              <a href={`https://${job.link}`} target="_blank" rel="noreferrer" className={`flex h-9 items-center gap-1 rounded-full bg-raised pr-3 pl-3.5 text-[13px] text-ink-2 transition-colors duration-150 hover:text-ink ${focusRing}`}>
                Open listing
                <ArrowUpRightIcon size={14} />
              </a>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-8">
              {/* Logo on the left, name and role stacked beside it, like the card but at panel size. */}
              <div className="flex items-center gap-4">
                <CompanyMark job={job} size="h-14 w-14 text-[22px]" radius="rounded-xl" />
                <div className="min-w-0">
                  <h2 className="truncate text-[22px] leading-tight font-semibold tracking-tight">{job.company}</h2>
                  <p className="mt-1 truncate text-[14px] text-ink-2">{job.role}</p>
                </div>
              </div>

              {/* The status row is the one control on the panel. Picking a lane here moves the card behind it. */}
              <div className="mt-6 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Status">
                {STATUSES.map((status) => {
                  const active = status.id === job.status;
                  return (
                    <button
                      key={status.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => onStatus(job.id, status.id)}
                      className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium transition-colors duration-150 ${focusRing} ${active ? "bg-ink text-canvas" : "bg-raised/70 text-ink-2 hover:bg-raised hover:text-ink"}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-canvas" : status.dot}`} aria-hidden="true" />
                      {status.label}
                    </button>
                  );
                })}
              </div>

              <dl className="mt-7 flex flex-col gap-1">
                <Row Icon={PinIcon} label="Location">{job.location}</Row>
                <Row Icon={CalendarIcon} label="Applied">{longDate(job.applied)}</Row>
                <Row Icon={CalendarIcon} label="Deadline">{longDate(job.deadline)}</Row>
                <Row Icon={LinkIcon} label="Listing">{job.link}</Row>
                <Row Icon={PersonIcon} label="Contact">{job.contact}</Row>
                <Row Icon={MailIcon} label="Email">{job.email}</Row>
              </dl>

              <h3 className="mt-6 text-[12px] text-ink-3">Notes</h3>
              {job.notes
                ? <p className="mt-2 text-[13px] leading-relaxed text-ink">{job.notes}</p>
                : <p className="mt-2 text-[13px] text-ink-3">Nothing written down yet. Add what you learned from the listing or the recruiter.</p>}
            </div>
          </>
        )}
      </aside>
    );
  }
