import { STATUSES } from "../jobs/statuses.js";
import { MailIcon, PersonIcon } from "../icons.jsx";
import nimbusMark from "../../assets/login/nimbus-mark.png";

// The first three lanes of the real board, with their real names and colours.
const LANES = STATUSES.slice(0, 3);

// Which lane the card sits in for each feature: it's saved while Fill In runs, applied by the time Contact Finder
// finds someone, and the Gmail reply moves it to Interviewing.
const LANE_FOR_STEP = [0, 1, 2];

// Faint stand-in cards under the live one, so the strip reads as a board and not a single card.
function GhostCard()
  {
    return (
      <div className="rounded-xl bg-surface/35 p-3" aria-hidden="true">
        <span className="block h-2 w-3/5 rounded-full bg-ink/10" />
        <span className="mt-2 block h-2 w-4/5 rounded-full bg-ink/[0.06]" />
      </div>
    );
  }

// The one card that acts out the feature on screen. Its lines come up one after another when it's first filled in,
// the contact fades in under the location, and a mail mark shows once the reply has moved it.
function LiveCard({ step })
  {
    const found = step >= 1;
    const replied = step >= 2;

    return (
      <div className="card-rise rounded-xl bg-surface p-3 shadow-[0_14px_30px_-14px_rgba(0,0,0,0.7)]">
        <div className="rise flex items-center gap-2" style={{ "--i": 2 }}>
          {/* On a white tile, the same way the board shows company logos. */}
          <img src={nimbusMark} alt="" className="size-5 shrink-0 rounded-md bg-white" />
          <span className="truncate text-[12px] font-semibold">Nimbus</span>
          <MailIcon size={12} className={`ml-auto shrink-0 text-cream transition-opacity duration-300 ease-out-strong ${replied ? "opacity-100" : "opacity-0"}`} />
        </div>
        <p className="rise mt-2 text-[12px] leading-snug text-ink" style={{ "--i": 4 }}>Software Engineer</p>
        <p className="rise mt-0.5 text-[11px] text-ink-3" style={{ "--i": 6 }}>Remote</p>
        <p className={`mt-2 flex items-center gap-1.5 text-[11px] text-ink-2 transition-[opacity,translate] duration-300 ease-out-strong ${found ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}>
          <PersonIcon size={11} className="shrink-0 text-cream" />
          <span className="truncate">Dana Reyes</span>
        </p>
      </div>
    );
  }

// A small slice of the board under the feature text. The live card slides between lanes as the features turn over,
// so you see what each one does to a real card. A new round starts a fresh card, keyed by round, which fills in again.
export default function BoardPreview({ step, round })
  {
    const lane = LANE_FOR_STEP[step];

    return (
      <div className="relative" aria-hidden="true">
        <div className="grid grid-cols-3 gap-2.5">
          {LANES.map((status) => (
            <div key={status.id} className="rounded-2xl bg-board-deep/45 p-2">
              <p className="flex items-center gap-1.5 px-1 pt-0.5 pb-2 text-[11px] font-medium text-ink-2">
                <span className={`h-1.5 w-1.5 rounded-full ${status.rail}`} />
                {status.label}
              </p>
              <div className="h-[112px]" />
              <div className="mt-2 space-y-2">
                <GhostCard />
              </div>
            </div>
          ))}
        </div>

        {/* Sits over the empty top slot of whichever lane it's in. Each lane is a third of the row less the gaps, and
            the move is the lane's own width plus one gap per lane. */}
        <div
          className="absolute top-[34px] left-2 w-[calc((100%-20px)/3-16px)] transition-transform duration-[650ms] ease-in-out-strong"
          style={{ transform: `translateX(calc(${lane} * (100% + 26px)))` }}
        >
          <LiveCard key={round} step={step} />
        </div>
      </div>
    );
  }
