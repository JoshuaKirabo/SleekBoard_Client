import { useEffect } from "react";

// One coordinate of a cubic bezier through (0, 0), (a, b), (c, d), (1, 1) at parameter s.
const bezierPoint = (s, a, c) => 3 * a * s * (1 - s) ** 2 + 3 * c * s ** 2 * (1 - s) + s ** 3;

// Turns a CSS cubic-bezier into a function from time gone (0 to 1) to progress made (0 to 1). Finds the curve's
// parameter for that time by halving, then reads the progress off it.
const curve = (x1, y1, x2, y2) => (time) =>
  {
    let low = 0;
    let high = 1;
    for(let step = 0; step < 24; step++)
      {
        const middle = (low + high) / 2;
        if(bezierPoint(middle, x1, x2) < time) low = middle;
        else high = middle;
      }
    return bezierPoint((low + high) / 2, y1, y2);
  };

// The app's travel curve, --ease-in-out-strong: leaves gently, lands soft.
export const travel = curve(0.77, 0, 0.175, 1);

// The app's gentle-both-ways curve, --ease-soft: gets going, keeps a steady hand, eases off.
export const steady = curve(0.45, 0, 0.55, 1);

// How far through a stretch of the lap we are, from 0 before it starts to 1 once it's over.
export const through = (lap, from, to) => Math.min(1, Math.max(0, (lap - from) / (to - from)));

// Reduced motion leaves the marks still, already in their resting pose.
const stillWanted = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Calls draw every frame with how far through its lap the mark is, from 0 to 1, for as long as the mark is up.
// The login marks are drawn by hand like this because Chrome won't move a mask's contents with CSS, and current
// Chrome doesn't run SVG's own animation at all. draw and parts must stay the same between renders.
export const useLap = (length, draw, parts) =>
  {
    useEffect(() =>
      {
        if(stillWanted()) return undefined;
        let frame = 0;
        const start = performance.now();
        // A frame's timestamp is when the frame began, which can be a moment before the effect read the clock, so the
        // time gone is held at zero rather than going negative.
        const tick = (now) =>
          {
            draw((Math.max(0, now - start) % length) / length, parts);
            frame = requestAnimationFrame(tick);
          };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
      }, [length, draw, parts]);
  };
