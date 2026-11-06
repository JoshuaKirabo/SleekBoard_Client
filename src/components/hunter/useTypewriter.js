import { useCallback, useEffect, useState } from "react";

// A short breath after punctuation, so the line reads like someone typing it and not a ticker.
const PAUSE_AFTER = { ",": 90, ".": 160, "?": 160, "!": 160 };

// When each character of the line should appear, in ms from the start of typing.
const scheduleFor = (text, speed) =>
  {
    let at = 0;
    return [...text].map((char) =>
      {
        at += speed + (PAUSE_AFTER[char] || 0);
        return at;
      });
  };

// How much of a line is showing while it types itself out. Nothing happens until `start` is true. The count comes
// from the clock rather than one timer per letter, so a slow frame never makes the line fall behind. finish() jumps
// to the whole line, for a click or key press that doesn't want to wait.
export default function useTypewriter(text, { start, speed = 18, instant = false })
  {
    const [shown, setShown] = useState(instant ? text.length : 0);

    useEffect(() =>
      {
        if(!start || instant) return;

        const schedule = scheduleFor(text, speed);
        const began = performance.now();
        let frame = 0;

        const tick = (now) =>
          {
            const elapsed = now - began;
            const count = schedule.filter((at) => at <= elapsed).length;
            setShown((current) => Math.max(current, count));
            if(count < text.length) frame = requestAnimationFrame(tick);
          };

        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
      }, [start, instant, text, speed]);

    const finish = useCallback(() => setShown(text.length), [text]);

    return { shown, done: shown >= text.length, finish };
  }
