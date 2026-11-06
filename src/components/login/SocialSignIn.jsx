import { GoogleMark, GitHubMark, FacebookMark } from "./brandIcons.jsx";

// The colour each coin fills with when you point at it.
const PROVIDERS = [
  { name: "Google", Mark: GoogleMark, brand: "#4285F4" },
  { name: "GitHub", Mark: GitHubMark, brand: "#24292F" },
  { name: "Facebook", Mark: FacebookMark, brand: "#1877F2" },
];

// White coins so each logo sits on the same ground whatever the glass behind it is doing. The brand fill on hover
// and press lives in index.css under .social-coin.
const coinClass = "social-coin grid size-[50px] cursor-pointer place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-cream";

// UI only for now. Once login lands, Google is the one that gets wired up, and only your email gets through.
export default function SocialSignIn()
  {
    return (
      <div className="flex justify-center gap-4">
        {PROVIDERS.map(({ name, Mark, brand }) => (
          <button key={name} type="button" aria-label={`Sign in with ${name}`} className={coinClass} style={{ "--brand": brand }}>
            <Mark className="size-[30px]" />
          </button>
        ))}
      </div>
    );
  }
