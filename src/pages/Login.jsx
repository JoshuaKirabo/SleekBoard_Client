import mark from "../assets/brand/mark-white.svg";
import LoginForm from "../components/login/LoginForm.jsx";
import SignInProblem from "../components/login/SignInProblem.jsx";
import FeaturePanel from "../components/login/FeaturePanel.jsx";

// The login screen, laid out after the reference shot. It sits outside the app layout, so no sidebar or header, and
// fills the whole window. The form sits on the left and what SleekBoard does on the right. Below lg that side drops
// away and the form has the screen to itself.
export default function Login()
  {
    return (
      <div className="login-frame grid min-h-dvh text-ink lg:grid-cols-[1fr_minmax(500px,42%)]">
        {/* The form hangs from a fixed height rather than centring, so a message appearing under a field never moves
            the greeting or the buttons above it. The mark is decoration: the heading already says SleekBoard. */}
        <main className="flex flex-col px-6 pt-10 pb-14 sm:px-12 lg:pt-12 lg:pl-16">
          <img src={mark} alt="" className="h-[22px] w-auto self-start" />
          <div className="mx-auto mb-auto w-full max-w-[388px] pt-14 lg:pt-0 lg:mt-[clamp(40px,10.5vh,140px)]">
            <LoginForm />
            <SignInProblem />
          </div>
        </main>

        <aside className="hidden p-11 pl-0 lg:block">
          <FeaturePanel />
        </aside>
      </div>
    );
  }
