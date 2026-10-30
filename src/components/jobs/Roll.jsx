import { useState } from "react";

// A line of text that rolls when it changes: the old words slide up and out while the new ones come up from below,
// so a status that moves on reads as moving on instead of flickering. See .roll in index.css.
// lineClass goes on the words inside each line, never on the line itself: a class like the shimmer brings its own
// animation, and on the same element it would replace the roll and leave the old words stuck on screen.
export default function Roll({ text, className = "", lineClass = "" })
  {
    const [shown, setShown] = useState({ text, leaving: "", turn: 0 });

    // New words: the ones on screen become the leaving copy. Done while rendering so both lines arrive in the same frame.
    if(shown.text !== text) setShown({ text, leaving: shown.text, turn: shown.turn + 1 });

    // Only the roll ending counts, not an animation on the words inside it.
    const dropLeaving = (event) =>
      {
        if(event.target === event.currentTarget) setShown((current) => ({ ...current, leaving: "" }));
      };

    return (
      <span className={`roll ${className}`}>
        {shown.leaving && (
          <span key={`out-${shown.turn}`} aria-hidden="true" className="roll-out" onAnimationEnd={dropLeaving}>
            <span className={lineClass}>{shown.leaving}</span>
          </span>
        )}
        <span key={`in-${shown.turn}`} className={shown.turn ? "roll-in" : ""}>
          <span className={lineClass}>{text}</span>
        </span>
      </span>
    );
  }
