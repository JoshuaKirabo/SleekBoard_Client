import { STATUSES } from "./statuses.js";
import SelectMenu from "../SelectMenu.jsx";

// Two faces for the same control. "well" is the form input in Add Job, a filled well like the text fields beside it.
// "pill" is the inline control on the detail panel, where it sits in a row rather than in a form.
const LOOKS = {
  well: `h-10 w-full rounded-xl bg-canvas px-3.5 text-[13px] text-ink hover:bg-board-deep data-[open=true]:bg-board-deep`,
  pill: `h-9 rounded-full bg-raised/70 pr-2.5 pl-3.5 text-[13px] font-medium text-ink hover:bg-raised data-[open=true]:bg-raised`,
};

const OPTIONS = STATUSES.map((status) => ({ value: status.id, label: status.label }));

// The six lanes, in our dropdown.
export default function StatusSelect({ value, onChange, look = "well", label = "Status" })
  {
    return <SelectMenu value={value} options={OPTIONS} onChange={onChange} label={label} trigger={LOOKS[look]} block={look === "well"} labelTrigger={look === "pill"} />;
  }
