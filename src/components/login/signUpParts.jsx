import { useRef } from "react";
import wordmark from "../../assets/brand/wordmark-white.svg";

// The sign-up page's own sizes and pieces. It looks like the login page, but it has four fields stacked where login has
// two, so its sizes and gaps are its own, fitted to fit an 800px-tall window with nothing scrolling (Josh: these pages
// never scroll). Login keeps its own sizes in LoginForm.jsx; nothing here changes it.

export const labelClass = "block pl-3 text-sm leading-5 text-ink-2";
// The first label sits a little way under the greeting; the rest follow the line under the field above.
export const firstLabelGap = "mt-5";
export const nextLabelGap = "mt-0.5";

// Filled pills in the app's well colours. The fill, hover and focus ring live in index.css.
export const fieldClass = "login-field mt-1.5 h-[42px] w-full rounded-full px-5 text-[15px] text-ink placeholder:text-ink-3";

// A pill with the eye inside its right end, so the text stops short of it.
export const passwordFieldClass = `${fieldClass} pr-12`;

export const checkboxLabelClass = "flex w-fit cursor-pointer items-center gap-2.5 pl-2 text-sm text-ink-2";

// The line under each field, kept in the layout whether or not it has anything to say, so a message showing up never
// moves the fields or buttons below it (Josh's bookshelf rule: build the shelf for the books to come). One line tall,
// sized for the longest thing the server says. The words fade in and out; the line itself never comes or goes.
const noteClass = "mt-1 h-[18px] pl-3 text-[13px] leading-[18px] text-halt transition-opacity duration-200 ease-out";

// The last words a line had, so they stay put while it fades out instead of vanishing first.
const useLastWords = (text) =>
  {
    const last = useRef("");
    if(text) last.current = text;
    return text || last.current;
  };

// One reserved line under a field. Empty, it's still there, just see-through and hidden from screen readers.
// `arrival` counts failed tries: each new one remounts the words, so their arrival (index.css, .login-note-arrive)
// plays again even when the message is the same as last time.
export function NoteLine({ id, text, alert, arrival })
  {
    const words = useLastWords(text);
    return (
      <p id={id} role={alert ? "alert" : undefined} aria-hidden={text ? undefined : true} className={`${noteClass} ${text ? "opacity-100" : "opacity-0"}`}>
        <span key={arrival} className={arrival ? "login-note-arrive" : undefined}>{words}</span>
      </p>
    );
  }

// "Welcome to" with the wordmark centred under it, like the login page's, a size smaller. The wordmark's alt text finishes the sentence.
export function Greeting()
  {
    return (
      <h1 className="vt-greeting text-center text-[30px] font-semibold leading-[1.05] tracking-[-0.025em]">
        Welcome to
        <img src={wordmark} alt="SleekBoard" className="mx-auto mt-2 block h-[22px] w-auto" />
      </h1>
    );
  }

// The big cream button at the bottom of the form. Busy while the server checks, so it can't be sent twice; the
// label says so and index.css changes only the colour.
export function SubmitButton({ busy, label, busyLabel })
  {
    return (
      <button type="submit" disabled={busy} className="vt-action login-submit mt-4 cursor-pointer h-11 w-full rounded-full text-[17px] font-semibold tracking-[-0.01em]">
        {/* Four pools of Board Blue light behind the label, the same as the Google button's. Styled in index.css under
            .login-submit-glow. */}
        <span className="login-submit-glow" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
        {/* The Board Blue line drawn round the pill from the bottom on hover. Styled under .login-submit-edge. */}
        <svg className="login-submit-edge" aria-hidden="true">
          <g>
            <rect width="100%" height="100%" rx="22" ry="22" fill="none" strokeWidth="1.5" vectorEffect="non-scaling-stroke" pathLength="1" strokeLinecap="round" />
          </g>
        </svg>
        {busy ? busyLabel : label}
      </button>
    );
  }

// OR between the two ways in, on lines that fade out toward the edges so they don't read as hard rules.
export function OrLine()
  {
    return (
      <div className="vt-or mt-3 flex items-center gap-4" aria-hidden="true">
        <span className="h-px flex-1 bg-linear-to-l from-line-strong to-transparent" />
        <span className="text-xs font-medium tracking-[0.14em] text-ink-3">OR</span>
        <span className="h-px flex-1 bg-linear-to-r from-line-strong to-transparent" />
      </div>
    );
  }
