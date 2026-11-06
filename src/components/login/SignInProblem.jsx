import { useSearchParams } from "react-router-dom";

// What went wrong, when the server sends you back here with ?signin=error&reason=… after Google.
const REASONS =
  {
    not_allowed: "Please use the owner's Google account. Only that account can sign in for now.",
    not_linkable: "Please sign in with the Google account you used before. This email belongs to a different one.",
    expired: "Please try again. That sign-in took too long or started in another tab.",
    cancelled: "Please try again. Sign-in was cancelled on Google's side.",
    google: "Please try again. Google didn't finish the sign-in.",
    not_set_up: "Please sign in with your email for now. Google sign-in isn't set up yet.",
  };

// One line under the form in the red of every sign-in message, read out as soon as it shows. Nothing when the
// sign-in didn't fail.
export default function SignInProblem()
  {
    const [params] = useSearchParams();
    if(params.get("signin") !== "error") return null;
    const message = REASONS[params.get("reason")] || "Please try again. Sign-in didn't work.";

    return <p role="alert" className="mt-6 w-full max-w-[388px] pl-3 text-sm leading-relaxed text-halt">{message}</p>;
  }
