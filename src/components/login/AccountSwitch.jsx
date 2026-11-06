import { Link } from "react-router-dom";

const linkClass = "rounded-sm font-medium text-cream transition-colors duration-150 ease-out hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

// The quiet line under the ways in that crosses between signing in and making an account. Each page keeps its own gap.
export default function AccountSwitch({ signUp })
  {
    return (
      <p className={`${signUp ? "mt-4" : "mt-5"} w-full max-w-[388px] text-center text-sm text-ink-3`}>
        {signUp ? "Have an account?" : "New here?"}{" "}
        <Link to={signUp ? "/login" : "/signup"} className={linkClass}>{signUp ? "Sign in" : "Create an account"}</Link>
      </p>
    );
  }
