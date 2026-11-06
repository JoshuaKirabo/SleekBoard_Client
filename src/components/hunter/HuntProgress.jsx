import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../jobs/spring.js";
import { postedLabel } from "./huntOptions.js";
import HuntMark from "./HuntMark.jsx";
import { focusRing } from "./fields/styles.js";

// How long the hunter stays on each step before it moves to the next. It holds on the last one until the hunt ends.
const STEP_MS = 2200;
// The new line's words wait this long for the old line to start leaving, then come in this far apart, each taking
// WORD_MS to land. These match .hunt-word in index.css.
const WORD_DELAY_MS = 90;
const WORD_GAP_MS = 45;
const WORD_MS = 520;

// What the hunter says it's doing, step by step, in your own numbers.
const stepsFor = (hunt) =>
  {
    const roles = hunt.roles.length;
    return [
      `Reading your ${roles} ${roles === 1 ? "role" : "roles"}`,
      hunt.posted ? `Scanning jobs from the last ${postedLabel(hunt.posted)}` : "Scanning fresh jobs",
      "Identifying top matches",
    ];
  };

// Moves through the steps on a timer and stops on the last one.
function useStep(count)
  {
    const [step, setStep] = useState(0);

    useEffect(() =>
      {
        if(step >= count - 1) return;
        const timer = setTimeout(() => setStep(step + 1), STEP_MS);
        return () => clearTimeout(timer);
      }, [step, count]);

    return step;
  }

// A line arriving word by word, each word rising out of a blur a beat after the one before. The shimmer only starts
// once the last word has landed, so the band never runs across words that are still moving.
function Words({ text })
  {
    const words = text.split(" ");
    const [landed, setLanded] = useState(false);

    useEffect(() =>
      {
        const timer = setTimeout(() => setLanded(true), WORD_DELAY_MS + (words.length - 1) * WORD_GAP_MS + WORD_MS);
        return () => clearTimeout(timer);
      }, [words.length]);

    return (
      <span className={landed ? "shimmer-text" : "text-ink-2"}>
        {words.map((word, index) => (
          <span key={index}>
            <span className="hunt-word" style={{ "--i": index }}>{word}</span>
            {index < words.length - 1 && " "}
          </span>
        ))}
      </span>
    );
  }

// The line the hunter is on. The old line lifts away and fades as the new one's words rise in after it. Both sit in
// the same grid cell, and nothing clips them, so neither is cut off on the way.
function StepLine({ steps, step })
  {
    return (
      <p className="hunt-line text-[19px] leading-tight font-semibold tracking-[-0.015em] sm:text-[21px]" role="status">
        {step > 0 && <span key={`out-${step}`} className="hunt-line-out text-ink-2" aria-hidden="true">{steps[step - 1]}</span>}
        <Words key={step} text={steps[step]} />
      </p>
    );
  }

// One short bar per step, lit up to the step the hunter is on.
function StepBars({ count, step })
  {
    return (
      <span className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => (
          <span key={index} className={`h-[3px] w-6 rounded-full transition-colors duration-500 ease-out-strong ${index <= step ? "bg-cream" : "bg-raised"}`} />
        ))}
      </span>
    );
  }

// The hunt under way. It comes up the moment you press Hunt: jobs slide past under you and lock into the logo one
// by one while the hunter says what it's doing. Stop ends the hunt.
export default function HuntProgress({ hunt, onStop })
  {
    const steps = stepsFor(hunt);
    const step = useStep(steps.length);
    const panel = useRef(null);

    // Bring it into view if the roles box pushed it below the fold.
    useEffect(() =>
      {
        panel.current?.scrollIntoView({ block: "nearest", behavior: prefersReducedMotion() ? "auto" : "smooth" });
      }, []);

    return (
      <section ref={panel} className="hunt-rise flex w-full items-center gap-5 sm:gap-6" aria-label="Hunting">
        <HuntMark />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <StepLine steps={steps} step={step} />
          <StepBars count={steps.length} step={step} />
        </div>

        <button type="button" onClick={onStop} className={`h-9 shrink-0 cursor-pointer rounded-full px-3.5 text-[13.5px] font-medium text-ink-2 transition-[background-color,color,scale] duration-150 ease-out-strong hover:bg-raised hover:text-ink active:scale-[0.97] ${focusRing}`}>
          Stop
        </button>
      </section>
    );
  }
