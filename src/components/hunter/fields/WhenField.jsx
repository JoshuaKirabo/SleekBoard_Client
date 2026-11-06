import { SEASONS, YEARS } from "../huntOptions.js";
import SelectMenu from "../../SelectMenu.jsx";
import { selectWell } from "./styles.js";

const YEAR_OPTIONS = [{ value: "", label: "Any year" }, ...YEARS.map((year) => ({ value: year, label: year }))];
const SEASON_OPTIONS = [{ value: "", label: "Any season" }, ...SEASONS.map((season) => ({ value: season, label: season }))];

// A year and a season, for when you can start or when you graduate. Either one can stay "Any".
export default function WhenField({ label, value, onChange })
  {
    return (
      <div className="grid grid-cols-2 gap-2">
        <SelectMenu value={value.year} options={YEAR_OPTIONS} onChange={(year) => onChange({ ...value, year })} label={`${label} year`} labelTrigger trigger={selectWell} />
        <SelectMenu value={value.season} options={SEASON_OPTIONS} onChange={(season) => onChange({ ...value, season })} label={`${label} season`} labelTrigger trigger={selectWell} />
      </div>
    );
  }
