// A small spring in Apple's two knobs: response is roughly how long the move takes, damping 1 means it settles
// without a bounce. X and Y run as separate springs so a flick that's mostly sideways doesn't get a vertical wobble.
export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function springTo({ from, velocity = { x: 0, y: 0 }, response = 0.35, damping = 1, onFrame, onDone })
  {
    const omega = (2 * Math.PI) / response;
    const stiffness = omega * omega;
    const friction = 2 * damping * omega;
    let x = from.x;
    let y = from.y;
    let vx = velocity.x;
    let vy = velocity.y;
    let last = performance.now();
    let frame = 0;

    const tick = (now) =>
      {
        // Capping the step keeps a dropped frame from launching the card across the screen.
        const dt = Math.min((now - last) / 1000, 1 / 30);
        last = now;
        const steps = 4;
        const h = dt / steps;
        for(let i = 0; i < steps; i++)
          {
            vx += (-stiffness * x - friction * vx) * h;
            vy += (-stiffness * y - friction * vy) * h;
            x += vx * h;
            y += vy * h;
          }

        const settled = Math.abs(x) < 0.3 && Math.abs(y) < 0.3 && Math.abs(vx) < 4 && Math.abs(vy) < 4;
        if(settled)
          {
            onFrame(0, 0);
            onDone?.();
            return;
          }

        onFrame(x, y);
        frame = requestAnimationFrame(tick);
      };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }

// Where a flick would coast to if nothing stopped it. Same decay curve Apple uses for scrolling, tuned a bit
// snappier so a small flick nudges the card one lane over instead of three. Capped under a lane's width so the
// flick can tip a card across the border it's near but never skip a lane.
export const project = (velocity, rate = 0.99, cap = 160) => Math.max(-cap, Math.min(cap, ((velocity / 1000) * rate) / (1 - rate)));

// Velocity from the last stretch of pointer samples, in px per second.
export const velocityFrom = (samples) =>
  {
    const latest = samples[samples.length - 1];
    const earlier = samples.find((sample) => latest.t - sample.t <= 100) || samples[0];
    const dt = Math.max(latest.t - earlier.t, 1);
    return { x: ((latest.x - earlier.x) / dt) * 1000, y: ((latest.y - earlier.y) / dt) * 1000 };
  };
