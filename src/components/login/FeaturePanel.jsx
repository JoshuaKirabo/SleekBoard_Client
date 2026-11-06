import { useState } from "react";
import BoardPreview from "./BoardPreview.jsx";
import ContactFinderMark from "./ContactFinderMark.jsx";
import FillInMark from "./FillInMark.jsx";
import GmailSyncMark from "./GmailSyncMark.jsx";

// What SleekBoard does for you, one at a time: what happens, then the feature's name and what it saves you. A feature
// with a Mark wears it beside its name.
const FEATURES = [
  {
    text: "Paste a job link and SleekBoard reads the posting for you. The role, company and location land on the card in one press.",
    name: "Fill In",
    Mark: FillInMark,
    line: "No more copy and paste",
  },
  {
    text: "SleekBoard finds a recruiter or hiring manager at the company, so every application has a person you can reach out to.",
    name: "Contact Finder",
    Mark: ContactFinderMark,
    line: "Someone to talk to, not just a form",
  },
  {
    text: "When a recruiter writes back, the card moves to the right lane by itself. Your board keeps up with your inbox.",
    name: "Gmail Sync",
    Mark: GmailSyncMark,
    line: "Replies move your cards for you",
  },
];

const barClass = "grid h-6 w-10 cursor-pointer place-items-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

// The dark right half of the login screen: what SleekBoard does, cycling through on its own, with a slice of the
// board underneath acting each one out on a card.
export default function FeaturePanel()
  {
    const [turn, setTurn] = useState({ index: 0, round: 0 });
    const feature = FEATURES[turn.index];

    // Coming back round to the first feature counts as a new round, so the board preview starts a fresh card.
    const goTo = (at) => setTurn((now) => ({ index: at, round: at === 0 && now.index !== 0 ? now.round + 1 : now.round }));

    // The lit bar's fill runs the clock. When it's full, the next statement comes in, and after the last one it starts over.
    const showNext = () => goTo((turn.index + 1) % FEATURES.length);

    return (
      <div className="login-feature-panel relative flex h-full flex-col overflow-hidden rounded-[30px] px-[52px] pt-[64px] pb-[52px]">
        {/* Clouds of blue and cream drifting under the grain. Pure decoration, styled in index.css. */}
        <div className="login-aurora" aria-hidden="true"><span /><span /><span /></div>

        <h2 className="relative pl-1 text-[44px] font-semibold leading-[1.3] tracking-[-0.025em]">
          Automate your<br />job search.
        </h2>

        <div key={turn.index} className="login-feature relative mt-10 min-h-[204px]">
          <p className="max-w-[400px] text-[17px] leading-[30px] text-ink">{feature.text}</p>
          <p className="mt-9 flex items-center gap-2.5 text-[19px] font-semibold tracking-[-0.01em]">
            {feature.Mark && <feature.Mark className="-my-1 size-8 shrink-0 text-cream" />}
            {feature.name}
          </p>
          <p className="mt-2 text-[17px] text-cream/70">{feature.line}</p>
        </div>

        <div className="relative mt-4 flex gap-1.5">
          {FEATURES.map((item, at) => (
            <button key={item.name} type="button" aria-label={`Show ${item.name}`} aria-current={at === turn.index} onClick={() => goTo(at)} className={barClass}>
              <span className="relative h-[3px] w-full overflow-hidden rounded-full bg-cream/20">
                {at < turn.index && <span className="absolute inset-0 rounded-full bg-cream" />}
                {at === turn.index && <span key={turn.index} className="login-progress-fill" onAnimationEnd={showNext} />}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-10 [@media(max-height:760px)]:hidden">
          <BoardPreview step={turn.index} round={turn.round} />
        </div>
      </div>
    );
  }
