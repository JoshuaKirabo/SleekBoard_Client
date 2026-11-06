import { Link } from "react-router-dom";
import useScreenSwap from "../useScreenSwap.js";

const linkClass = "rounded-sm font-medium text-cream transition-colors duration-150 ease-out hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

// A plain click, as opposed to one meant to open the page in a new tab or window, which the browser should handle.
const isPlainClick = (event) => event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

// The quiet line under the ways in that crosses between signing in and making an account. Each page keeps its own gap.
// A plain click plays the form swap (useScreenSwap's "form-signup" or "form-login", styled in index.css), where the form grows into the other
// one in place; the link still works as a link for opening in a new tab.
export default function AccountSwitch({ signUp })
  {
    const swap = useScreenSwap();
    const to = signUp ? "/login" : "/signup";

    const onClick = (event) =>
      {
        if(!isPlainClick(event)) return;
        event.preventDefault();
        swap(to, signUp ? "form-login" : "form-signup");
      };

    return (
      <p className={`vt-switch ${signUp ? "mt-4" : "mt-5"} w-full max-w-[388px] text-center text-sm text-ink-3`}>
        {signUp ? "Have an account?" : "New here?"}{" "}
        <Link to={to} onClick={onClick} className={linkClass}>{signUp ? "Sign in" : "Create an account"}</Link>
      </p>
    );
  }
