import { useEffect, useId, useRef, useState } from "react";
import { ChevronDownIcon, LogOutIcon } from "./icons.jsx";
import useScreenSwap from "./useScreenSwap.js";
import { signOut } from "../services/api.js";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

// Your avatar, name and email in the header. Clicking it drops a small menu out of its bottom right corner, with
// Log out as the only thing in it for now. It closes on Escape, Tab, or a click anywhere else, and Escape hands
// focus back to the avatar so you never lose your place.
export default function ProfileMenu({ user })
  {
    const [open, setOpen] = useState(false);
    const root = useRef(null);
    const trigger = useRef(null);
    const item = useRef(null);
    const id = useId();
    const swap = useScreenSwap();

    const close = (refocus = true) =>
      {
        setOpen(false);
        if(refocus) trigger.current?.focus();
      };

    // Ends the session on the server, then plays the swap back to the login screen. If the server can't be reached,
    // you still go: the next page you open will ask it again.
    const logOut = async () =>
      {
        try
          {
            await signOut();
          }
        catch(error)
          {
            console.warn("Couldn't end the session on the server:", error.message);
          }
        swap("/login", "out");
      };

    // The one item takes focus as soon as the menu opens, so Enter right after opening logs you out.
    useEffect(() =>
      {
        if(open) item.current?.focus();
      }, [open]);

    useEffect(() =>
      {
        if(!open) return;
        const onDown = (event) =>
          {
            if(!root.current?.contains(event.target)) close(false);
          };
        document.addEventListener("pointerdown", onDown);
        return () => document.removeEventListener("pointerdown", onDown);
      }, [open]);

    const onTriggerKey = (event) =>
      {
        if(event.key === "ArrowDown" || event.key === "ArrowUp")
          {
            event.preventDefault();
            setOpen(true);
          }
      };

    const onMenuKey = (event) =>
      {
        switch(event.key)
          {
            case "Escape": event.preventDefault(); close(); break;
            case "Tab": close(false); break;
            case "ArrowDown":
            case "ArrowUp":
            case "Home":
            case "End": event.preventDefault(); item.current?.focus(); break;
            default: break;
          }
      };

    return (
      <div ref={root} className="relative ml-1">
        {/* Stays put when pressed. The menu dropping open under it is the answer. */}
        <button
          ref={trigger}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={`${id}-menu`}
          aria-label={`Account, ${user.name}`}
          data-open={open}
          onClick={() => (open ? close() : setOpen(true))}
          onKeyDown={onTriggerKey}
          className={`flex cursor-pointer items-center gap-2.5 rounded-full py-1 pr-2.5 pl-1 text-left transition-[background-color] duration-150 ease-out-strong hover:bg-raised/70 data-[open=true]:bg-raised/70 ${focusRing}`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cream text-[12px] font-semibold text-surface" aria-hidden="true">{user.initials}</span>
          <span className="hidden leading-tight sm:block">
            <span className="block text-[13px] font-semibold">{user.name}</span>
            <span className="block text-[11px] text-ink-3">{user.email}</span>
          </span>
          <ChevronDownIcon size={14} className={`shrink-0 text-ink-3 transition-transform duration-200 ease-out-strong ${open ? "rotate-180" : ""}`} />
        </button>

        {/* Drops open from its top edge like a blind unrolling, settling down a few pixels as it comes into focus.
            The clip runs wide at the sides and bottom so the shadow isn't cut off once it's open. Closing lifts it
            back the way it came, quicker than it arrived. Transitions, so a fast second click turns it straight
            round. With reduced motion it only fades. */}
        <div
          id={`${id}-menu`}
          role="menu"
          aria-label="Account"
          inert={!open}
          onKeyDown={onMenuKey}
          className={`absolute top-full right-0 z-30 mt-2 min-w-[176px] origin-top-right rounded-[14px] bg-raised p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.3),0_18px_40px_-12px_rgba(0,0,0,0.65)] transition-[opacity,translate,clip-path,filter] ease-out-strong motion-reduce:transition-opacity ${open ? "translate-y-0 opacity-100 blur-none duration-[260ms] [clip-path:inset(-24px_-32px_-56px_-32px)]" : "pointer-events-none -translate-y-1.5 opacity-0 blur-[3px] duration-150 [clip-path:inset(-24px_-32px_100%_-32px)] motion-reduce:translate-y-0 motion-reduce:blur-none"}`}
        >
          <button
            ref={item}
            type="button"
            role="menuitem"
            tabIndex={-1}
            onClick={logOut}
            className="flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-[9px] px-3 text-[13px] whitespace-nowrap text-ink-2 outline-none transition-colors duration-100 hover:bg-surface hover:text-ink focus-visible:bg-surface focus-visible:text-ink"
          >
            <LogOutIcon size={15} />
            Log out
          </button>
        </div>
      </div>
    );
  }
