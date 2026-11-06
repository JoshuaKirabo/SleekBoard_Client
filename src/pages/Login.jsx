import { useRef } from "react";
import mark from "../assets/brand/mark-white.svg";
import LoginForm from "../components/login/LoginForm.jsx";
import SignUpForm from "../components/login/SignUpForm.jsx";
import AccountSwitch from "../components/login/AccountSwitch.jsx";
import SignInProblem from "../components/login/SignInProblem.jsx";
import FeaturePanel from "../components/login/FeaturePanel.jsx";
import useFitHeight from "../components/login/useFitHeight.js";

// The login screen, laid out after the reference shot. It sits outside the app layout, so no sidebar or header, and
// fills the whole window. The form sits on the left and what SleekBoard does on the right. Below lg that side drops
// away and the form has the screen to itself. The page is exactly one window tall and never scrolls (Josh): the form's
// sizes fit a laptop window, and a shorter one shrinks the card to fit. /signup shows the sign-up form in the same frame;
// each form has its own sizes, fitted to its own fields, so changing one never changes the other.
export default function Login({ signUp = false })
  {
    const column = useRef(null);
    const card = useRef(null);
    const scale = useFitHeight(column, card);

    return (
      <div className="login-frame grid h-dvh overflow-hidden text-ink lg:grid-cols-[1fr_minmax(500px,42%)]">
        {/* The form hangs from a fixed height rather than centring, so a message appearing under a field never moves
            the greeting or the buttons above it. The mark is decoration: the heading already says SleekBoard. */}
        <main ref={column} className="relative flex min-h-0 flex-col overflow-hidden px-6 pt-8 pb-6 sm:px-12 lg:pl-16">
          <img src={mark} alt="" className="h-[22px] w-auto self-start" />
          <div
            ref={card}
            style={scale < 1 ? { transform: `scale(${scale})` } : undefined}
            className={`mx-auto w-full max-w-[388px] origin-top ${signUp ? "mt-[clamp(16px,5vh,64px)]" : "mt-[clamp(20px,8vh,80px)]"}`}
          >
            {signUp ? <SignUpForm /> : <LoginForm />}
            <AccountSwitch signUp={signUp} />
            {!signUp && <SignInProblem />}
          </div>
        </main>

        <aside className="hidden p-11 pl-0 lg:block">
          <FeaturePanel />
        </aside>
      </div>
    );
  }
