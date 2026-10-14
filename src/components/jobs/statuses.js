// The six lanes, in the order an application actually moves through them. The dot colour comes from the
// brand scale instead of a rainbow of tints: muted while saved, Board Blue once sent, cream in the room,
// white when the offer lands, faded once rejected, and just an outline when they went quiet on you.
export const STATUSES = [
  { id: "saved", label: "Saved", dot: "bg-ink-3", rail: "bg-ink-3", empty: "Save a role you want to apply to." },
  { id: "applied", label: "Applied", dot: "bg-board-bright", rail: "bg-board-bright", empty: "Nothing sent yet." },
  { id: "interviewing", label: "Interviewing", dot: "bg-cream", rail: "bg-cream", empty: "No interviews on the calendar." },
  { id: "offer", label: "Offer", dot: "bg-ink", rail: "bg-ink", empty: "No offers yet. Keep going." },
  { id: "rejected", label: "Rejected", dot: "bg-stone/50", rail: "bg-stone/40", empty: "Nothing rejected." },
  { id: "ghosted", label: "Ghosted", dot: "border border-ink-3 bg-transparent", rail: "bg-ink-3/30", empty: "No one has gone quiet on you." },
];

export const statusById = (id) => STATUSES.find((status) => status.id === id);

// "15 Oct" style so the cards stay narrow.
export const shortDate = (iso) =>
  {
    if(!iso) return "";
    const date = new Date(`${iso}T00:00:00`);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

export const longDate = (iso) =>
  {
    if(!iso) return "";
    const date = new Date(`${iso}T00:00:00`);
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  };

// Days until the deadline, measured from today. Negative means it already passed.
export const daysUntil = (iso) =>
  {
    if(!iso) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(`${iso}T00:00:00`);
    return Math.round((date - today) / 86400000);
  };
