import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import GoogleSignIn from "./GoogleSignIn.jsx";
import useScreenSwap from "../useScreenSwap.js";
import { logIn, problemOf } from "../../services/api.js";
import { safeNext } from "../auth/nextPath.js";
import wordmark from "../../assets/brand/wordmark-white.svg";

const labelClass = "block pl-3 text-base text-ink-2";

// Filled pills in the app's well colours. The fill, hover and focus ring live in index.css.
const fieldClass = "login-field mt-3.5 h-[52px] w-full rounded-full px-[22px] text-[17px] text-ink placeholder:text-ink-3";

const linkClass = "cursor-pointer rounded-sm text-base text-cream underline underline-offset-[3px] transition-colors duration-150 hover:text-ink active:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

// The left half of the login card: the greeting, email and password, and the ways in.
export default function LoginForm()
  {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [keepLoggedIn, setKeepLoggedIn] = useState(true);
    const [problem, setProblem] = useState("");
    const [params] = useSearchParams();

    const swap = useScreenSwap();

    // Checks the email and password with the server, then walks into the page you were sent here from (?next=), as
    // long as it's one of the board's own. If it didn't work, the server's reason shows under the form.
    const handleSubmit = async (event) =>
      {
        event.preventDefault();
        setProblem("");
        try
          {
            await logIn({ email, password, remember: keepLoggedIn });
          }
        catch(error)
          {
            return setProblem(problemOf(error));
          }
        swap(safeNext(params.get("next")), "in");
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
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="Johndoe@gmail.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={fieldClass}
        />

        <label htmlFor="login-password" className={`${labelClass} mt-4`}>Password</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••••"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={`${fieldClass} placeholder:tracking-[0.18em]`}
        />

        <div className="mt-6 flex items-center justify-between pr-4 pl-2">
          <label className="flex cursor-pointer items-center gap-2.5 text-base text-ink-2">
            <input
              type="checkbox"
              checked={keepLoggedIn}
              onChange={(event) => setKeepLoggedIn(event.target.checked)}
              className="login-check"
            />
            Keep me logged in
          </label>
          <button type="button" className={linkClass}>Forgot Password</button>
        </div>

        <button type="submit" className="login-submit mt-7 cursor-pointer h-[53px] w-full rounded-full text-xl font-semibold tracking-[-0.01em]">
          Sign in
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
