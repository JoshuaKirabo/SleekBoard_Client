import { SALARY_MAX, SALARY_STEP } from "../huntOptions.js";
import Switch from "./Switch.jsx";

const thousands = (amount) => `$${Math.round(amount / 1000)}k`;

// The lowest yearly pay you'd take. "Open to any" is on until you turn it off, and the slider rests until then.
export default function SalaryField({ value, onChange })
  {
    return (
      <div className="rounded-xl bg-canvas px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[15px] font-semibold tabular-nums">{value.any ? "Any salary" : `${thousands(value.min)} or more a year`}</p>
          <Switch label="Open to any" on={value.any} onChange={(any) => onChange({ ...value, any })} />
        </div>
        <input
          type="range"
          min="0"
          max={SALARY_MAX}
          step={SALARY_STEP}
          value={value.min}
          disabled={value.any}
          onChange={(event) => onChange({ ...value, min: Number(event.target.value) })}
          aria-label="Minimum yearly salary"
          className="hunt-range mt-4 w-full"
        />
      </div>
    );
  }
