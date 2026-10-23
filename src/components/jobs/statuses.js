// The six lanes, in the order an application actually moves through them. Each lane's rail carries its own colour:
// stone while it is still to apply, Board Blue once sent, cream in the room, sage when the offer lands, brick once
// rejected, and a dim grey when they went quiet on you.
export const STATUSES = [
  { id: "saved", label: "To Apply", rail: "bg-stone", empty: "Save a role you want to apply to." },
  { id: "applied", label: "Applied", rail: "bg-board-bright", empty: "Nothing sent yet." },
  { id: "interviewing", label: "Interviewing", rail: "bg-cream", empty: "No interviews on the calendar." },
  { id: "offer", label: "Offer", rail: "bg-go", empty: "No offers yet. Keep going." },
  { id: "rejected", label: "Rejected", rail: "bg-halt", empty: "Nothing rejected." },
  { id: "ghosted", label: "Ghosted", rail: "bg-ink-3/50", empty: "No one has gone quiet on you." },
];

export const statusById = (id) => STATUSES.find((status) => status.id === id);

// Ghosted is out of the pipeline, so it isn't a lane. It lives in a drawer opened from the toolbar, and the board
// gives its space to the five lanes that are still moving.
export const DRAWER_ID = "ghosted";
export const BOARD_LANES = STATUSES.filter((status) => status.id !== DRAWER_ID);

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
