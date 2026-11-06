import { Link } from "react-router-dom";

const linkClass = "rounded-sm font-medium text-cream transition-colors duration-150 ease-out hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

// The quiet line under the ways in for someone without an account yet. /signup has nothing behind it so far.
export default function CreateAccountLink()
  {
    return (
      <p className="mt-8 w-full max-w-[388px] text-center text-[15px] text-ink-3">
        New here?{" "}
        <Link to="/signup" className={linkClass}>Create an account</Link>
      </p>
    );
  }
