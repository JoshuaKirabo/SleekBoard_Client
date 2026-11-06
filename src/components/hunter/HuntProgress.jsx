import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../jobs/spring.js";
import { postedLabel } from "./huntOptions.js";
import HuntRadar from "./HuntRadar.jsx";
import { focusRing } from "./fields/styles.js";

// How long the hunter stays on each step before it moves to the next. It holds on the last one until the hunt ends.
const STEP_MS = 1600;
// How many jobs are on the scope by each step.
const FOUND_BY_STEP = [0, 2, 4];

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

// The line the hunter is on. The old one rolls up and out as the new one rolls in under it.
function StepLine({ steps, step })
  {
    return (
      <p className="roll text-[19px] leading-tight font-semibold tracking-[-0.015em] sm:text-[21px]" role="status">
        {step > 0 && <span key={step - 1} className="roll-out text-ink-2" aria-hidden="true">{steps[step - 1]}</span>}
        <span key={step} className="roll-in shimmer-text">{steps[step]}</span>
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

// The hunt under way. It comes up the moment you press Hunt: the scope sweeps, the hunter says what it's doing, and
// jobs light up on the scope as it finds them. Stop ends the hunt.
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
      <section ref={panel} className="hunt-rise flex w-full items-center gap-5 rounded-3xl bg-surface p-4 pr-5 sm:gap-6 sm:p-5 sm:pr-6" aria-label="Hunting">
        <HuntRadar found={FOUND_BY_STEP[step]} />

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
