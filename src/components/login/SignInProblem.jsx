import { useSearchParams } from "react-router-dom";

// What went wrong, when the server sends you back here with ?signin=error&reason=… after Google.
const REASONS =
  {
    not_allowed: "That Google account isn't allowed in. Only the owner's account can sign in for now.",
    not_linkable: "That email already belongs to an account that signs in with a different Google account.",
    expired: "That sign-in took too long or started in another tab. Try again.",
    cancelled: "Sign-in was cancelled on Google's side.",
    google: "Google didn't finish the sign-in. Try again.",
    not_set_up: "Google sign-in isn't set up on the server yet.",
  };

// One line under the form, read out as soon as it shows. Nothing when the sign-in didn't fail.
export default function SignInProblem()
  {
    const [params] = useSearchParams();
    if(params.get("signin") !== "error") return null;
    const message = REASONS[params.get("reason")] || "Sign-in didn't work. Try again.";

    return <p role="alert" className="mt-6 w-full max-w-[388px] pl-3 text-sm leading-relaxed text-ink-2">{message}</p>;
  }
