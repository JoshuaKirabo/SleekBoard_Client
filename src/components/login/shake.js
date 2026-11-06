// The head-shake a field gives when a sign-in fails, after NextStep's login screen (UserProvider.tsx, the keyphrase
// shake): eight swings that die down, 12px out at first, over 520ms. Same offsets, length and curve as theirs, played
// with the browser's own element.animate instead of a motion library, since nothing else here needs one.
const SWINGS = [0, -12, 11, -10, 9, -8, 6, -4, 0];
const SHAKE_MS = 520;
// NextStep's curve, used for every swing between two offsets, the way Motion applies one ease to each part.
const SWING_EASE = "cubic-bezier(0.36, 0.07, 0.19, 0.97)";

const KEYFRAMES = SWINGS.map((x) => ({ transform: `translateX(${x}px)`, easing: SWING_EASE }));

// Someone who's asked their computer for less motion gets the message without the shake.
const wantsLessMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Shakes this element once. A shake still going is dropped first, so failing twice in a row starts it over cleanly.
export const shake = (element) =>
  {
    if(!element || wantsLessMotion()) return;
    element.getAnimations().forEach((running) => running.cancel());
    element.animate(KEYFRAMES, { duration: SHAKE_MS });
  };
