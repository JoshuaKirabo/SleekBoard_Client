import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import GoogleSignIn from "./GoogleSignIn.jsx";
import useScreenSwap from "../useScreenSwap.js";
import { logIn, problemOf } from "../../services/api.js";
import { safeNext } from "../auth/nextPath.js";
import wordmark from "../../assets/brand/wordmark-white.svg";

const labelClass = "block pl-3 text-base text-ink-2";

// Filled pills in the app's well colours. The fill, hover and focus ring live in index.css.
const fieldClass = "login-field mt-3.5 h-[52px] w-full rounded-full px-[22px] text-[17px] text-ink placeholder:text-ink-3";

// The note under a field left empty: the same size as the line under the form, in the app's brick for something to fix.
const gapClass = "mt-2 pl-3 text-sm leading-relaxed text-halt";

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
    const [keepLoggedIn, setKeepLoggedIn] = useState(true);
    const [problem, setProblem] = useState("");
    const [gapsShown, setGapsShown] = useState(false);
    const [busy, setBusy] = useState(false);
    const [params] = useSearchParams();
    const emailField = useRef(null);
    const passwordField = useRef(null);

    const swap = useScreenSwap();

    // Like Mailtrain, the empty-field notes stay hidden until a sign-in is tried with a gap. From then on they follow
    // the fields as you type: gone once a field has something in it, back if it's emptied again.
    const gaps = gapsShown ? gapsIn({ email, password }) : NO_GAPS;

    // Nothing goes to the server with a field empty. The notes show and the first empty field takes the focus, so a
    // screen reader reads its note out.
    const holdBack = (found) =>
      {
        setGapsShown(true);
        setProblem("");
        (found.email ? emailField : passwordField).current.focus();
      };

    // Checks the email and password with the server, then walks into the page you were sent here from (?next=), as
    // long as it's one of the board's own. Sign in stays busy through the walk in; if it was turned down, it frees up
    // and the reason shows under the form.
    const send = async () =>
      {
        setProblem("");
        setBusy(true);
        try
          {
            await logIn({ email, password, remember: keepLoggedIn });
          }
        catch(error)
          {
            setBusy(false);
            return setProblem(refusalOf(error));
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
          aria-invalid={gaps.email ? true : undefined}
          aria-describedby={gaps.email ? "login-email-gap" : undefined}
          className={fieldClass}
        />
        {gaps.email && <p id="login-email-gap" className={gapClass}>{gaps.email}</p>}

        <label htmlFor="login-password" className={`${labelClass} mt-4`}>Password</label>
        <input
          ref={passwordField}
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={gaps.password ? true : undefined}
          aria-describedby={gaps.password ? "login-password-gap" : undefined}
          className={`${fieldClass} placeholder:tracking-[0.18em]`}
        />
        {gaps.password && <p id="login-password-gap" className={gapClass}>{gaps.password}</p>}

        <label className="mt-6 flex w-fit cursor-pointer items-center gap-2.5 pl-2 text-base text-ink-2">
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

        {problem && <p role="alert" className="mt-6 pl-3 text-sm leading-relaxed text-ink-2">{problem}</p>}
      </form>
    );
  }
