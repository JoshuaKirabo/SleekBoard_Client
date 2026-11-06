import { useState } from "react";
import NotchedPanel from "./NotchedPanel.jsx";
import Starburst from "./Starburst.jsx";

// What SleekBoard does for you, one at a time: what happens, then the feature's name and what it saves you.
const FEATURES = [
  {
    text: "Paste a job link and SleekBoard reads the posting for you. The role, company and location land on the card in one press.",
    name: "Fill in",
    line: "No more copy and paste",
  },
  {
    text: "SleekBoard finds a recruiter or hiring manager at the company, so every application has a person you can reach out to.",
    name: "Contact finder",
    line: "Someone to talk to, not just a form",
  },
  {
    text: "When a recruiter writes back, the card moves to the right lane by itself. Your board keeps up with your inbox.",
    name: "Gmail sync",
    line: "Replies move your cards for you",
  },
];

const PANEL_NOTCH = { notchWidth: 85, notchHeight: 49, radius: 30 };

const barClass = "grid h-6 w-10 cursor-pointer place-items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

// The dark right half of the login card: what SleekBoard does, cycling through on its own, with a line star
// glowing behind it.
export default function FeaturePanel()
  {
    const [index, setIndex] = useState(0);
    const feature = FEATURES[index];

    // The lit bar's fill runs the clock. When it's full, the next statement comes in, and after the last one it starts over.
    const showNext = () => setIndex((now) => (now + 1) % FEATURES.length);

    return (
      <NotchedPanel notch={PANEL_NOTCH} className="login-feature-panel relative h-full overflow-hidden px-[52px] pt-[64px]">
        <Starburst className="pointer-events-none absolute top-[64%] left-[76%] w-[330px] -translate-x-1/2 -translate-y-1/2" />

        <h2 className="relative pl-1 text-[44px] font-semibold leading-[1.3] tracking-[-0.025em]">
          Automate your<br />job search.
        </h2>

        <div key={index} className="login-feature relative mt-10 min-h-[204px]">
          <p className="max-w-[400px] text-[17px] leading-[30px] text-white/95">{feature.text}</p>
          <p className="mt-9 text-[19px] font-semibold tracking-[-0.01em]">{feature.name}</p>
          <p className="mt-2 text-[17px] text-white/85">{feature.line}</p>
        </div>

        <div className="relative mt-4 flex gap-1.5">
          {FEATURES.map((item, at) => (
            <button key={item.name} type="button" aria-label={`Show ${item.name}`} aria-current={at === index} onClick={() => setIndex(at)} className={barClass}>
              <span className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/20">
                {at < index && <span className="absolute inset-0 rounded-full bg-cream" />}
                {at === index && <span key={index} className="login-progress-fill" onAnimationEnd={showNext} />}
              </span>
            </button>
          ))}
        </div>
      </NotchedPanel>
    );
  }
