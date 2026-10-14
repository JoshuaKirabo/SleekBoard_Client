import { SettingsIcon, BellIcon } from "./icons.jsx";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";
const roundButton = `inline-flex h-9 cursor-pointer items-center justify-center rounded-full text-ink-2 transition-colors duration-150 hover:text-ink ${focusRing}`;

// Placeholder account, same as the reference screen, until real sign-in lands.
const user = { name: "Udochukwu Chimbo", email: "Chimboudo@gmail.com", initials: "UC", unread: 2 };

export default function Header({ title })
  {
    return (
      <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-line px-5 sm:px-7">
        <h1 className="text-[22px] font-semibold tracking-tight sm:text-2xl">{title}</h1>

        <div className="flex items-center gap-2 sm:gap-3">
          <button type="button" className={`${roundButton} w-9 border border-line-strong hover:bg-raised`} aria-label="Settings">
            <SettingsIcon size={16} />
          </button>

          <button type="button" className={`${roundButton} gap-2 bg-raised pr-1.5 pl-3 hover:bg-white/[0.12]`} aria-label={`Notifications, ${user.unread} new`}>
            <BellIcon size={16} />
            <span className="rounded-full bg-surface px-2 py-1 text-[10px] font-semibold text-ink">{user.unread} new</span>
          </button>

          <div className="ml-1 flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-[12px] font-semibold text-surface" aria-hidden="true">{user.initials}</span>
            <div className="hidden leading-tight sm:block">
              <p className="text-[13px] font-semibold">{user.name}</p>
              <p className="text-[11px] text-ink-3">{user.email}</p>
            </div>
          </div>
        </div>
      </header>
    );
  }
