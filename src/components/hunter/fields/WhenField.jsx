import { SEASONS, YEARS } from "../huntOptions.js";
import { focusRing, well } from "./styles.js";

const select = `${well} h-11 w-full cursor-pointer px-3.5 text-[14.5px] focus:bg-board-deep focus:outline-none ${focusRing}`;

// A year and a season, for when you can start or when you graduate. Either one can stay "Any".
export default function WhenField({ label, value, onChange })
  {
    return (
      <div className="grid grid-cols-2 gap-2">
        <select value={value.year} onChange={(event) => onChange({ ...value, year: event.target.value })} aria-label={`${label} year`} className={select}>
          <option value="">Any year</option>
          {YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
        <select value={value.season} onChange={(event) => onChange({ ...value, season: event.target.value })} aria-label={`${label} season`} className={select}>
          <option value="">Any season</option>
          {SEASONS.map((season) => <option key={season} value={season}>{season}</option>)}
        </select>
      </div>
    );
  }
