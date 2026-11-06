import { useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import GoogleSignIn from "./GoogleSignIn.jsx";
import ShowPasswordButton from "./ShowPasswordButton.jsx";
import { shake } from "./shake.js";
import useScreenSwap from "../useScreenSwap.js";
import { logIn, problemOf } from "../../services/api.js";
import { safeNext } from "../auth/nextPath.js";
import wordmark from "../../assets/brand/wordmark-white.svg";

const labelClass = "block pl-3 text-base text-ink-2";

// Filled pills in the app's well colours. The fill, hover and focus ring live in index.css.
const fieldClass = "login-field mt-3.5 h-[52px] w-full rounded-full px-[22px] text-[17px] text-ink placeholder:text-ink-3";

// The line under each field, kept in the layout whether or not it has anything to say, so a message showing up never
// moves the fields or buttons below it (Josh's bookshelf rule: build the shelf for the books to come). One line tall,
// sized for the longest thing the server says. The words fade in and out; the line itself never comes or goes.
const noteClass = "mt-1.5 h-[22px] pl-3 text-sm leading-[22px] text-halt transition-opacity duration-200 ease-out";

// The last words a line had, so they stay put while it fades out instead of vanishing first.
const useLastWords = (text) =>
  {
    const last = useRef("");
    if(text) last.current = text;
    return text || last.current;
  };

// One reserved line under a field. Empty, it's still there, just see-through and hidden from screen readers.
// `arrival` counts failed sign-ins: each new one remounts the words, so their arrival (index.css, .login-note-arrive)
// plays again even when the message is the same as last time.
function NoteLine({ id, text, alert, arrival })
  {
    const words = useLastWords(text);
    return (
      <p id={id} role={alert ? "alert" : undefined} aria-hidden={text ? undefined : true} className={`${noteClass} ${text ? "opacity-100" : "opacity-0"}`}>
        <span key={arrival} className={arrival ? "login-note-arrive" : undefined}>{words}</span>
      </p>
    );
  }

const NO_GAPS = { email: "", password: "" };

// What each empty field says. An email of only spaces counts as empty because the server trims it away; a password is
// taken exactly as typed.
const gapsIn = ({ email, password }) => ({ email: email.trim() ? "" : "Enter your email.", password: password ? "" : "Enter your password." });

// The line under the form when the server turns a sign-in down. Its 401, 429 and 503 each carry their own sentence, and
// problemOf covers no reply at all. A reply with no sentence (a crash, a proxy's error page) gets a plain try-again
// rather than problemOf's "couldn't reach", since the server did answer.
const refusalOf = (error) => error.response && !error.response.data?.message ? "Sign-in didn't work. Try again." : problemOf(error);

// The left half of the login card: the greeting, email and password, and the ways in.
export default function LoginForm()
  {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // Starts unticked, like Mailtrain's login form: staying signed in for 30 days is something you choose, so a shared
    // computer forgets you when the browser closes unless you said otherwise.
    const [keepLoggedIn, setKeepLoggedIn] = useState(false);
    const [problem, setProblem] = useState("");
    // True when the server said the email and password don't match, so both fields carry the message.
    const [mismatch, setMismatch] = useState(false);
    const [gapsShown, setGapsShown] = useState(false);
    const [busy, setBusy] = useState(false);
    // Whether the password shows as typed rather than as dots.
    const [passwordShown, setPasswordShown] = useState(false);
    // Where the caret was in the password when the eye was pressed. Chrome sends it back to the start when a field
    // switches between hidden and shown, so it's put back right after.
    const passwordCaret = useRef(null);
    const [params] = useSearchParams();
    const emailField = useRef(null);
    const passwordField = useRef(null);
    // The password pill with its eye, which shake together.
    const passwordBox = useRef(null);
    // How many sign-ins have failed here, so each one's message arrives again.
    const [failures, setFailures] = useState(0);

    const swap = useScreenSwap();

    // A failed sign-in, after NextStep's: these fields shake, and the message under them arrives again. The shake waits
    // a frame, as theirs does, so it starts together with the message's new state.
    const flinch = (fields) =>
      {
        setFailures((count) => count + 1);
        requestAnimationFrame(() => fields.forEach((field) => shake(field.current)));
      };

    // Shows or hides the password, remembering where the caret was so you carry on typing where you left off.
    const togglePassword = () =>
      {
        const field = passwordField.current;
        passwordCaret.current = [field.selectionStart, field.selectionEnd];
        setPasswordShown((now) => !now);
      };

    // Puts the caret back once the field has switched. Chrome then moves it to the start a few milliseconds later, as it
    // takes another look at the field, so it's put back once more just after that, well before anyone can type.
    useLayoutEffect(() =>
      {
        const caret = passwordCaret.current;
        if(!caret) return;
        passwordCaret.current = null;
        const field = passwordField.current;
        const putBack = () => field.setSelectionRange(...caret);
        putBack();
        const timer = setTimeout(putBack, 60);
        return () => clearTimeout(timer);
      }, [passwordShown]);

    // Like Mailtrain, the empty-field notes stay hidden until a sign-in is tried with a gap. From then on they follow
    // the fields as you type: gone once a field has something in it, back if it's emptied again.
    const gaps = gapsShown ? gapsIn({ email, password }) : NO_GAPS;

    // Nothing goes to the server with a field empty. The notes show and the first empty field takes the focus, so a
    // screen reader reads its note out.
    const holdBack = (found) =>
      {
        setGapsShown(true);
        setProblem("");
        setMismatch(false);
        flinch([found.email && emailField, found.password && passwordBox].filter(Boolean));
        (found.email ? emailField : passwordField).current.focus();
      };

    // Sign in frees up and the reason shows under the password. When the email and password didn't match, the password
    // is selected so you can type it again straight away.
    const turnDown = (error) =>
      {
        const wrongPair = error.response?.status === 401;
        setBusy(false);
        setProblem(refusalOf(error));
        setMismatch(wrongPair);
        flinch([passwordBox]);
        if(!wrongPair) return;
        passwordField.current.focus();
        passwordField.current.select();
      };

    // Checks the email and password with the server, then walks into the page you were sent here from (?next=), as
    // long as it's one of the board's own. Sign in stays busy through the walk in.
    const send = async () =>
      {
        setProblem("");
        setMismatch(false);
        setBusy(true);
        try
          {
            await logIn({ email, password, remember: keepLoggedIn });
          }
        catch(error)
          {
            return turnDown(error);
          }
        swap(safeNext(params.get("next")), "in");
      };

    const handleSubmit = (event) =>
      {
        event.preventDefault();
        if(busy) return;
        const found = gapsIn({ email, password });
        if(found.email || found.password) return holdBack(found);
        send();
      };

    return (
      <form onSubmit={handleSubmit} className="w-full max-w-[388px]" noValidate>
        {/* The name is the wordmark itself, on its own line under the greeting. Its alt text finishes the sentence. */}
        <h1 className="text-[42px] font-semibold leading-[1.05] tracking-[-0.025em]">
          Welcome to
          <img src={wordmark} alt="SleekBoard" className="mt-3.5 block h-[30px] w-auto" />
        </h1>

        <label htmlFor="login-email" className={`${labelClass} mt-[46px]`}>Email</label>
        <input
          ref={emailField}
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="Johndoe@gmail.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={gaps.email || mismatch ? true : undefined}
          aria-describedby={gaps.email ? "login-email-note" : mismatch ? "login-password-note" : undefined}
          className={fieldClass}
        />
        <NoteLine id="login-email-note" text={gaps.email} arrival={failures} />

        <label htmlFor="login-password" className={`${labelClass} mt-2.5`}>Password</label>
        {/* The eye sits inside the pill's right end, so the text stops short of it. */}
        <div ref={passwordBox} className="relative">
          <input
            ref={passwordField}
            id="login-password"
            type={passwordShown ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-invalid={gaps.password || mismatch ? true : undefined}
            aria-describedby={gaps.password || problem ? "login-password-note" : undefined}
            className={`${fieldClass} pr-14 placeholder:tracking-[0.18em]`}
          />
          <ShowPasswordButton shown={passwordShown} onToggle={togglePassword} controls="login-password" />
        </div>
        {/* Shared by the password's empty-field note and the server's answer, which sits right under the fields it's
            about. An empty field comes first: it's the thing to fix before anything is sent. */}
        <NoteLine id="login-password-note" text={gaps.password || problem} alert arrival={failures} />

        <label className="mt-3 flex w-fit cursor-pointer items-center gap-2.5 pl-2 text-base text-ink-2">
          <input
            type="checkbox"
            checked={keepLoggedIn}
            onChange={(event) => setKeepLoggedIn(event.target.checked)}
            className="login-check"
          />
          Keep me logged in
        </label>

        {/* Busy while the server checks, so it can't be sent twice. The label says so; index.css changes only the colour. */}
        <button type="submit" disabled={busy} className="login-submit mt-7 cursor-pointer h-[53px] w-full rounded-full text-xl font-semibold tracking-[-0.01em]">
          {/* Four pools of Board Blue light behind the label, the same as Log in with Google's. Styled in index.css under
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
              <rect width="100%" height="100%" rx="25.5" ry="25.5" fill="none" strokeWidth="1.5" vectorEffect="non-scaling-stroke" pathLength="1" strokeLinecap="round" />
            </g>
          </svg>
          {busy ? "Signing in…" : "Sign in"}
        </button>

        {/* OR between the two ways in, on lines that fade out toward the edges so they don't read as hard rules. */}
        <div className="mt-7 flex items-center gap-4" aria-hidden="true">
          <span className="h-px flex-1 bg-linear-to-l from-line-strong to-transparent" />
          <span className="text-xs font-medium tracking-[0.14em] text-ink-3">OR</span>
          <span className="h-px flex-1 bg-linear-to-r from-line-strong to-transparent" />
        </div>

        <div className="mt-7">
          <GoogleSignIn />
        </div>
      </form>
    );
  }
