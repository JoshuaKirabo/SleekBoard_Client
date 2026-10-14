import { useState } from "react";
import { BulbIcon, ChevronLeftIcon, ChevronRightIcon } from "../icons.jsx";

const arrowClass = "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-ink text-board transition-opacity duration-150 hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

// Board Blue takes the place of the reference's green: the one card on the page that isn't Sleek Gray.
export default function InsightCard({ insights })
  {
    const [index, setIndex] = useState(1);
    const current = insights[index];
    const step = (by) => setIndex((index + by + insights.length) % insights.length);

    return (
      <section className="flex flex-col rounded-2xl bg-[radial-gradient(130%_90%_at_0%_0%,var(--color-board-light)_0%,var(--color-board)_45%,var(--color-board-deep)_100%)] p-5 text-ink" aria-roledescription="carousel" aria-label="Insight">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold">
            <BulbIcon size={18} />
            Insight
          </h2>
          <div className="flex gap-2">
            <button type="button" className={arrowClass} onClick={() => step(-1)} aria-label="Previous insight">
              <ChevronLeftIcon size={16} />
            </button>
            <button type="button" className={arrowClass} onClick={() => step(1)} aria-label="Next insight">
              <ChevronRightIcon size={16} />
            </button>
          </div>
        </div>

        <p className="mt-9 text-[52px] leading-none font-semibold tracking-tight tabular-nums">{current.value}</p>

        <p className="mt-5 text-[13px] leading-relaxed">
          <span className="font-semibold">{current.lead}</span>
          <span className="text-cream/70"> {current.rest}</span>
        </p>

        {/* The active segment is twice as wide as the rest, like the reference's indicator strip. */}
        <div className="mt-auto flex gap-2 pt-8" aria-hidden="true">
          {insights.map((insight, i) => (
            <span key={insight.value} className={`h-[3px] rounded-full transition-all duration-200 ${i === index ? "flex-[2] bg-ink" : "flex-1 bg-ink/25"}`} />
          ))}
        </div>
      </section>
    );
  }
