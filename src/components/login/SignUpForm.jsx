import { useRef, useState } from "react";
import GoogleSignIn from "./GoogleSignIn.jsx";
import ShowPasswordButton from "./ShowPasswordButton.jsx";
import { Greeting, NoteLine, OrLine, SubmitButton, checkboxLabelClass, fieldClass, firstLabelGap, labelClass, nextLabelGap, passwordFieldClass } from "./signUpParts.jsx";
import usePasswordEye from "./usePasswordEye.js";
import { shake } from "./shake.js";

// Shortest password the form takes, NIST's floor for a password someone chooses themselves.
const SHORTEST_PASSWORD = 8;

const NO_GAPS = { name: "", email: "", password: "", confirm: "", terms: "" };

const nameGap = (name) => name.trim() ? "" : "Please enter your name.";

// Something before and after an @ is all the form asks.
const emailGap = (email) =>
  {
    if(!email.trim()) return "Please enter your email.";
    return /^[^\s@]+@[^\s@]+$/.test(email.trim()) ? "" : "Please enter a full email, like name@gmail.com.";
  };

// A password is taken exactly as typed, spaces and all.
const passwordGap = (password) =>
  {
    if(!password) return "Please choose a password.";
    return password.length < SHORTEST_PASSWORD ? `Please use at least ${SHORTEST_PASSWORD} characters.` : "";
  };

const confirmGap = (password, confirm) =>
  {
    if(!confirm) return "Please type your password again.";
    return confirm === password ? "" : "Please make sure both passwords match.";
  };

const termsGap = (agreed) => agreed ? "" : "Please agree to the terms to continue.";

const gapsIn = ({ name, email, password, confirm, agreed }) =>
  ({
    name: nameGap(name),
    email: emailGap(email),
    password: passwordGap(password),
    confirm: confirmGap(password, confirm),
    terms: termsGap(agreed),
  });

const hasGap = (found) => Object.values(found).some(Boolean);

// The sign-up card: the login page's look, with its own fields stacked as in the CureSync reference and its own sizes
// (signUpParts.jsx). Every field and the terms box keep a reserved line under them, so a message never moves anything.
// The vt- classes name the pieces that glide in from the login page (index.css, "Login and sign-up"). It checks what's
// typed; making the account on the server is the next step.
export default function SignUpForm()
  {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [gapsShown, setGapsShown] = useState(false);
    const nameField = useRef(null);
    const emailField = useRef(null);
    const passwordField = useRef(null);
    const confirmField = useRef(null);
    const termsBox = useRef(null);
    // Each password pill with its eye, which shake together.
    const passwordBox = useRef(null);
    const confirmBox = useRef(null);
    const [passwordShown, togglePassword] = usePasswordEye(passwordField);
    const [confirmShown, toggleConfirm] = usePasswordEye(confirmField);
    // How many tries have fallen short, so each one's messages arrive again.
    const [failures, setFailures] = useState(0);

    // The notes stay hidden until Create account is pressed with something to fix, then follow the fields as you type.
    const gaps = gapsShown ? gapsIn({ name, email, password, confirm, agreed }) : NO_GAPS;

    // The things to fix shake, the same as a failed sign-in, and the first of them takes the focus so a screen reader
    // reads its note out.
    const holdBack = (found) =>
      {
        const toFix = [
          [found.name, nameField, nameField],
          [found.email, emailField, emailField],
          [found.password, passwordBox, passwordField],
          [found.confirm, confirmBox, confirmField],
          [found.terms, termsBox, termsBox],
        ].filter(([gap]) => gap);
        setGapsShown(true);
        setFailures((count) => count + 1);
        requestAnimationFrame(() => toFix.forEach(([, box]) => shake(box.current)));
        toFix[0][2].current.focus();
      };

    const handleSubmit = (event) =>
      {
        event.preventDefault();
        const found = gapsIn({ name, email, password, confirm, agreed });
        if(hasGap(found)) holdBack(found);
      };

    return (
      <form onSubmit={handleSubmit} className="w-full max-w-[388px]" noValidate>
        <Greeting />

        <div className={`vt-extra vt-name ${firstLabelGap}`}>
          <label htmlFor="signup-name" className={labelClass}>Name</label>
          <input
            ref={nameField}
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={gaps.name ? true : undefined}
            aria-describedby={gaps.name ? "signup-name-note" : undefined}
            className={fieldClass}
          />
          <NoteLine id="signup-name-note" text={gaps.name} arrival={failures} />
        </div>

        <div className={`vt-email ${nextLabelGap}`}>
          <label htmlFor="signup-email" className={labelClass}>Email</label>
          <input
            ref={emailField}
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="Johndoe@gmail.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={gaps.email ? true : undefined}
            aria-describedby={gaps.email ? "signup-email-note" : undefined}
            className={fieldClass}
          />
          <NoteLine id="signup-email-note" text={gaps.email} arrival={failures} />
        </div>

        <div className={`vt-password ${nextLabelGap}`}>
          <label htmlFor="signup-password" className={labelClass}>Password</label>
          <div ref={passwordBox} className="relative">
            <input
              ref={passwordField}
              id="signup-password"
              type={passwordShown ? "text" : "password"}
              autoComplete="new-password"
              placeholder={`At least ${SHORTEST_PASSWORD} characters`}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={gaps.password ? true : undefined}
              aria-describedby={gaps.password ? "signup-password-note" : undefined}
              className={passwordFieldClass}
            />
            <ShowPasswordButton shown={passwordShown} onToggle={togglePassword} controls="signup-password" compact />
          </div>
          <NoteLine id="signup-password-note" text={gaps.password} arrival={failures} />
        </div>

        <div className={`vt-extra vt-confirm ${nextLabelGap}`}>
          <label htmlFor="signup-confirm" className={labelClass}>Confirm password</label>
          <div ref={confirmBox} className="relative">
            <input
              ref={confirmField}
              id="signup-confirm"
              type={confirmShown ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Type it again"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              aria-invalid={gaps.confirm ? true : undefined}
              aria-describedby={gaps.confirm ? "signup-confirm-note" : undefined}
              className={passwordFieldClass}
            />
            <ShowPasswordButton shown={confirmShown} onToggle={toggleConfirm} controls="signup-confirm" compact />
          </div>
          <NoteLine id="signup-confirm-note" text={gaps.confirm} arrival={failures} />
        </div>

        <div className="vt-extra vt-terms mt-1.5">
          <label className={checkboxLabelClass}>
            <input
              ref={termsBox}
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
              aria-invalid={gaps.terms ? true : undefined}
              aria-describedby={gaps.terms ? "signup-terms-note" : undefined}
              className="login-check"
            />
            I agree to the Terms and Privacy Policy
          </label>
          <NoteLine id="signup-terms-note" text={gaps.terms} arrival={failures} />
        </div>

        <SubmitButton busy={false} label="Create account" busyLabel="Creating account…" />

        <OrLine />

        <div className="vt-google mt-3">
          <GoogleSignIn label="Sign up with Google" compact />
        </div>
      </form>
    );
  }
