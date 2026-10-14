import Card from "./Card.jsx";
import Donut from "../charts/Donut.jsx";

export default function ResumeSuccessCard({ segments })
  {
    return (
      <Card title="Resume version success">
        <div className="flex flex-1 items-center justify-between gap-6">
          <ul className="space-y-4">
            {segments.map((segment) => (
              <li key={segment.name} className="flex items-center gap-2.5 text-[13px]">
                <span className={`h-1.5 w-1.5 rounded-full ${segment.dot}`} aria-hidden="true" />
                <span className="text-ink-2">{segment.name}</span>
                <span className="ml-1 font-semibold tabular-nums">{segment.value}%</span>
              </li>
            ))}
          </ul>

          <Donut segments={segments} label="Resume success split by iteration" />
        </div>
      </Card>
    );
  }
