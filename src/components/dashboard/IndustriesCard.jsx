import Card from "./Card.jsx";
import LineChart from "../charts/LineChart.jsx";
import { ChevronDownIcon } from "../icons.jsx";

// A real select under the pill so the keyboard and screen readers get the native control.
function RangeSelect()
  {
    return (
      <label className="relative inline-flex cursor-pointer items-center rounded-lg border border-line-strong bg-raised text-[12px] font-medium text-ink-2 transition-colors duration-150 hover:text-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-cream">
        <span className="sr-only">Date range</span>
        <select defaultValue="1w" className="cursor-pointer appearance-none bg-transparent py-1.5 pr-7 pl-3 text-inherit outline-none">
          <option value="1w">1 Week</option>
          <option value="2w">2 Weeks</option>
          <option value="1m">1 Month</option>
        </select>
        <ChevronDownIcon size={14} className="pointer-events-none absolute right-2" />
      </label>
    );
  }

export default function IndustriesCard({ stats, series, labels })
  {
    return (
      <Card title="Industries" action={<RangeSelect />}>
        <dl className="flex flex-wrap gap-x-7 gap-y-2">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-1.5">
              <dd className="order-first text-[22px] font-semibold tabular-nums">{stat.value}</dd>
              <dt className="text-[13px] text-ink-2">{stat.label}</dt>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex flex-1 flex-col">
          <LineChart values={series} labels={labels} label="Applications per day over the last week" />
        </div>
      </Card>
    );
  }
