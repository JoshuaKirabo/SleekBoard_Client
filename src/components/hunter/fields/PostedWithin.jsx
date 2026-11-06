import { useState } from "react";
import { POSTED_PRESETS } from "../huntOptions.js";
import SelectMenu from "../../SelectMenu.jsx";
import { focusRing, well, pill, selectWellSmall } from "./styles.js";

const UNITS = [{ value: "hours", label: "hours" }, { value: "days", label: "days" }];

const same = (a, b) => a && b && a.amount === b.amount && a.unit === b.unit;

// How new a job has to be before the hunter shows it to you. The quick picks are shortcuts; Custom takes any number
// of hours or days, because what counts as fresh is yours to say.
export default function PostedWithin({ value, onChange })
  {
    const isPreset = POSTED_PRESETS.some((preset) => same(preset, value));
    const [custom, setCustom] = useState(Boolean(value) && !isPreset);
    const customValue = value || { amount: 12, unit: "hours" };

    const pickPreset = (preset) =>
      {
        setCustom(false);
        onChange(preset);
      };

    const openCustom = () =>
      {
        setCustom(true);
        onChange(customValue);
      };

    const setAmount = (event) =>
      {
        const amount = Math.max(1, Math.min(999, Number(event.target.value) || 1));
        onChange({ ...customValue, amount });
      };

    const chosen = (on) => (on ? "bg-cream text-canvas" : "bg-canvas text-ink-2 hover:bg-raised hover:text-ink");

    return (
      <div className="flex flex-wrap items-center gap-2">
        {POSTED_PRESETS.map((preset) =>
          {
            const on = !custom && same(preset, value);
            return (
              <button key={preset.label} type="button" aria-pressed={on} onClick={() => pickPreset({ amount: preset.amount, unit: preset.unit })} className={`${pill} h-10 px-4 text-[14px] ${chosen(on)}`}>
                {preset.label}
              </button>
            );
          })}
        <button type="button" aria-pressed={custom} onClick={openCustom} className={`${pill} h-10 px-4 text-[14px] ${chosen(custom)}`}>
          Custom
        </button>

        {custom && (
          <span className="tag-pop flex items-center gap-2">
            <input type="number" min="1" max="999" value={customValue.amount} onChange={setAmount} aria-label="How many" className={`${well} h-10 w-20 px-3 text-[14px] focus:bg-board-deep focus:outline-none ${focusRing}`} />
            <SelectMenu value={customValue.unit} options={UNITS} onChange={(unit) => onChange({ ...customValue, unit })} label="Hours or days" labelTrigger block={false} trigger={selectWellSmall} />
          </span>
        )}
      </div>
    );
  }
