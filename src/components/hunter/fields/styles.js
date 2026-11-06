// Shared looks for the hunt preferences fields, so every well and pill in the popup matches the Add job sheet.
export const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

// Filled wells, not outlined boxes: a step darker than the popup, and brighter on focus instead of ringed.
export const well = "rounded-xl bg-canvas text-ink transition-colors duration-150";

// The dropdown triggers in the popup: wells that lift on hover and while open, never tinted blue.
export const selectWell = `${well} h-12 w-full px-4 text-[14.5px] hover:bg-raised data-[open=true]:bg-raised`;
export const selectWellSmall = `${well} h-10 px-3 text-[14px] hover:bg-raised data-[open=true]:bg-raised`;

// Small round add/remove pills.
export const pill = `flex h-8 cursor-pointer items-center gap-1 rounded-full px-3 text-[13px] font-medium transition-[background-color,color,scale] duration-150 ease-out-strong active:scale-[0.96] ${focusRing}`;
