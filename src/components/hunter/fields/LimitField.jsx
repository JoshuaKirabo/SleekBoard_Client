import Switch from "./Switch.jsx";

// A limit you can set or leave open: the lowest salary you'd take, the most years of experience a job may ask for.
// "Open to all" is on until you turn it off, and the slider rests until then. `describe` says the set limit in words.
export default function LimitField({ value, onChange, max, step, describe, anyLabel, sliderLabel })
  {
    return (
      <div className="rounded-xl bg-canvas px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[15px] font-semibold tabular-nums">{value.any ? anyLabel : describe(value.amount)}</p>
          <Switch label="Open to all" on={value.any} onChange={(any) => onChange({ ...value, any })} />
        </div>
        <input
          type="range"
          min="0"
          max={max}
          step={step}
          value={value.amount}
          disabled={value.any}
          onChange={(event) => onChange({ ...value, amount: Number(event.target.value) })}
          aria-label={sliderLabel}
          className="hunt-range mt-4 w-full"
        />
      </div>
    );
  }
