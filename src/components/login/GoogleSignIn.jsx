import { GoogleMark } from "./brandIcons.jsx";
import { googleSignInUrl } from "../../services/api.js";

// The one other way in. The light on hover and press lives in index.css under .google-signin.
// Pressing it leaves for the server's sign-in link, which goes on to Google. Only the owner's email gets through.
export default function GoogleSignIn()
  {
    return (
      <button type="button" onClick={() => window.location.assign(googleSignInUrl)} className="google-signin flex h-[53px] w-full cursor-pointer items-center justify-center gap-3 rounded-full text-[17px] font-medium">
        <GoogleMark className="size-[22px]" />
        Log in with Google
      </button>
    );
  }
