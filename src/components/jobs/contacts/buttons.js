// Button looks shared by the Contacts section, matching the panel's own pills.

export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

const base = `flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-[background-color,color,opacity] duration-150 disabled:cursor-default disabled:opacity-50 ${focusRing}`;

// The one thing to press: cream on the dark panel.
export const mainButton = `${base} bg-cream text-canvas enabled:hover:bg-white`;

export const pillButton = `${base} bg-raised text-ink-2 enabled:hover:text-ink`;

// Text only, for the second choice next to a pill.
export const quietButton = `${base} px-2.5 text-ink-3 enabled:hover:text-ink`;
