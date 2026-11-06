import { GoogleMark } from "./brandIcons.jsx";
import { googleSignInUrl } from "../../services/api.js";

// The one other way in. The light and edge on hover and press live in index.css under .google-signin.
// Pressing it leaves for the server's sign-in link, which goes on to Google. Only the owner's email gets through.
export default function GoogleSignIn()
  {
    return (
      <button type="button" onClick={() => window.location.assign(googleSignInUrl)} className="google-signin flex h-[53px] w-full cursor-pointer items-center justify-center gap-3 rounded-full text-[17px] font-medium">
        {/* Four pools of light in the G's colours, behind the label. Styled in index.css under .google-glow. */}
        <span className="google-glow" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
        {/* The edge light, drawn round the pill from the bottom on hover, like a job card's. Styled under .google-edge.
            The group turns it 180° so the draw starts at the bottom, which is why the colours run right to left here. */}
        <svg className="google-edge" aria-hidden="true">
          <defs>
            <linearGradient id="google-edge-colours" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#4285F4" />
              <stop offset="36%" stopColor="#EA4335" />
              <stop offset="64%" stopColor="#FBBC05" />
              <stop offset="100%" stopColor="#34A853" />
            </linearGradient>
          </defs>
          <g>
            <rect width="100%" height="100%" rx="25.5" ry="25.5" fill="none" stroke="url(#google-edge-colours)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" pathLength="1" strokeLinecap="round" />
          </g>
        </svg>
        <GoogleMark className="size-[22px]" />
        Log in with Google
      </button>
    );
  }
