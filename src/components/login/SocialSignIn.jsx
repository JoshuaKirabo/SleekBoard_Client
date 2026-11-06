import { GoogleMark, GitHubMark, FacebookMark } from "./brandIcons.jsx";

const PROVIDERS = [
  { name: "Google", Mark: GoogleMark },
  { name: "GitHub", Mark: GitHubMark },
  { name: "Facebook", Mark: FacebookMark },
];

// White coins so each logo sits on the same ground whatever the glass behind it is doing. They dip on press.
const coinClass = "grid size-[50px] cursor-pointer place-items-center rounded-full bg-white shadow-[0_6px_18px_-6px_rgb(0_0_0/0.45)] transition-[scale,box-shadow] duration-100 ease-out hover:shadow-[0_10px_24px_-8px_rgb(0_0_0/0.55)] active:scale-[0.94] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-cream";

// UI only for now. Once login lands, Google is the one that gets wired up, and only your email gets through.
export default function SocialSignIn()
  {
    return (
      <div className="flex justify-center gap-4">
        {PROVIDERS.map(({ name, Mark }) => (
          <button key={name} type="button" aria-label={`Sign in with ${name}`} className={coinClass}>
            <Mark className="size-[30px]" />
          </button>
        ))}
      </div>
    );
  }
