import { useEffect, useState } from "react";
import { HunterIcon } from "../icons.jsx";
import { prefersReducedMotion } from "../jobs/spring.js";
import useTypewriter from "./useTypewriter.js";

// The hunter's beats before it speaks: it turns up, shows it's typing, then the words type themselves out.
const ARRIVE_MS = 260;
const THINK_MS = 700;

// The hunter sending you a message. Its icon lands first, a typing bubble follows it, and then that bubble gives way
// to the line itself typing out. A click or any key skips to the whole line. onDone fires once every word is on
// screen, so whatever comes next waits for the hunter to finish talking.
//
// With reduced motion the line is simply there, no typing.
export default function AgentMessage({ text, onDone })
  {
    const [still] = useState(prefersReducedMotion);
    const [phase, setPhase] = useState(still ? "typing" : "arrive");
    const { shown, done, finish } = useTypewriter(text, { start: phase === "typing", instant: still });

    // arrive → thinking → typing, each on its own timer so leaving the page mid-way leaves nothing running.
    useEffect(() =>
      {
        const next = { arrive: ["thinking", ARRIVE_MS], thinking: ["typing", THINK_MS] }[phase];
        if(!next) return;
        const timer = setTimeout(() => setPhase(next[0]), next[1]);
        return () => clearTimeout(timer);
      }, [phase]);

    useEffect(() =>
      {
        if(done) onDone?.();
      }, [done, onDone]);

    // Any key while the hunter is still talking skips to the end of what it's saying.
    useEffect(() =>
      {
        if(done) return;
        const skip = () =>
          {
            setPhase("typing");
            finish();
          };
        window.addEventListener("keydown", skip);
        return () => window.removeEventListener("keydown", skip);
      }, [done, finish]);

    const skip = () =>
      {
        if(done) return;
        setPhase("typing");
        finish();
      };

    return (
      <div className="flex flex-col items-start gap-3" onPointerDown={skip}>
        <span className="hunt-avatar flex h-11 w-11 items-center justify-center rounded-full bg-surface text-cream">
          <HunterIcon size={22} />
        </span>

        {phase === "thinking" && (
          <span className="hunt-bubble flex h-[52px] items-center gap-1.5 rounded-3xl rounded-tl-lg bg-surface px-5" role="status" aria-label="The hunter is typing">
            <span className="hunt-dot" />
            <span className="hunt-dot" style={{ "--i": 1 }} />
            <span className="hunt-dot" style={{ "--i": 2 }} />
          </span>
        )}

        {phase === "typing" && (
          <p className={`${still ? "" : "hunt-bubble"} max-w-full rounded-3xl rounded-tl-lg bg-surface px-5 py-3.5 text-[20px] leading-snug font-medium tracking-tight text-pretty sm:text-[22px]`}>
            <span className="sr-only">{text}</span>
            {/* The untyped rest is on the page but clear, so the bubble is its full size from the first letter and
                the words never shuffle as they arrive. */}
            <span aria-hidden="true">
              {text.slice(0, shown)}
              {!done && <span className="hunt-caret" />}
              <span className="text-transparent">{text.slice(shown)}</span>
            </span>
          </p>
        )}
      </div>
    );
  }
