import Card from "./Card.jsx";

// Bars keep a 30% floor so the smallest count still reads as a bar instead of a sliver, as in the reference.
const barHeight = (value, max) => `${30 + (value / max) * 70}%`;

export default function MatchScoreCard({ score, bars })
  {
    const max = Math.max(...bars.map((bar) => bar.value));

    return (
      <Card title="Match Score Average">
        <div className="flex flex-1 items-stretch justify-between gap-6">
          <div className="flex max-w-[160px] flex-col justify-center">
            <p className="text-[48px] leading-none font-semibold tracking-tight text-cream tabular-nums">{score}</p>
            <p className="mt-4 text-[12px] leading-snug text-ink-2">Ratio of jobs found to jobs successfully applied</p>
          </div>

          <ul className="flex h-[150px] items-stretch gap-6 pr-2" aria-label="Counts by stage">
            {bars.map((bar) => (
              <li key={bar.name} className="flex w-7 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end">
                  <span className={`block w-full rounded-[3px] ${bar.fill}`} style={{ height: barHeight(bar.value, max) }} />
                </div>
                <span className="text-[11px] text-ink-2 tabular-nums">{bar.value}</span>
                <span className="sr-only">{bar.name}</span>
              </li>
            ))}
          </ul>
        </div>

        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-ink-2">
          {bars.map((bar) => (
            <li key={bar.name} className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${bar.dot}`} aria-hidden="true" />
              {bar.name}
            </li>
          ))}
        </ul>
      </Card>
    );
  }
