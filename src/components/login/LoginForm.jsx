import { useState } from "react";
import SocialSignIn from "./SocialSignIn.jsx";
import useScreenSwap from "../useScreenSwap.js";
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

    const swap = useScreenSwap();

    // There's no account check yet, so Sign in walks you straight into the app. That way the way in and out can be tried.
    const handleSubmit = (event) =>
      {
        event.preventDefault();
        swap("/", "in");
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

        <div className="mt-10">
          <SocialSignIn />
        </div>
      </form>
    );
  }
