import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AgentMessage from "../components/hunter/AgentMessage.jsx";
import RolesBox from "../components/hunter/RolesBox.jsx";
import HuntPreferences from "../components/hunter/HuntPreferences.jsx";
import { EMPTY_HUNT } from "../components/hunter/huntOptions.js";

// Nobody has saved a hunt yet, since the hunt settings don't reach the server yet, so the page opens as a new user.
// Add ?roles=sample to the address while running locally to see it with this one filled in.
const SAMPLE_HUNT =
  {
    ...EMPTY_HUNT,
    roles: [
      "Backend Engineer", "Java Engineer", "Python Engineer", "Machine Learning Engineer", "AI Engineer",
      "Machine Learning/AI Researcher", "Machine Learning, Deep Learning", "LLM Engineer",
      "Machine Learning, Model Training and Inference", "Machine Learning, Operations (ML Ops)",
      "Machine Learning, Infrastructure", "Machine Learning, Search System", "Data Annotation/AI Tutor", "Machine Learning, Ads",
    ],
    jobTypes: ["Internship"],
    workModels: ["Onsite", "Hybrid", "Remote"],
    levels: ["Intern/New Grad", "Entry Level"],
    locations: ["United States"],
    posted: { amount: 24, unit: "hours" },
  };

const GREETINGS =
  {
    roles: "Now I want to confirm I'm hunting the right roles for you.",
    none: "Tell me which roles to hunt, and I'll bring you the fresh ones.",
  };

// The quieter chips under the roles, in the popup's order: job type, work model, location, experience level.
const detailsOf = (hunt) => [...hunt.jobTypes, ...hunt.workModels, ...hunt.locations, ...hunt.levels];

// The Job Hunter's first screen. The hunter sends you a message, and once it has finished typing, the box with your
// roles comes up under it. Edit roles or Add roles opens the big preferences popup. The sidebar stays, so the
// conversation sits in one readable column in the space beside it.
export default function JobHunter()
  {
    const [params] = useSearchParams();
    const [hunt, setHunt] = useState(() => (import.meta.env.DEV && params.get("roles") === "sample" ? SAMPLE_HUNT : EMPTY_HUNT));
    const [editing, setEditing] = useState(false);

    // The box waits for the line the hunter is on now. A new line (your first roles saved) hides it until that
    // line has typed out, so the box always comes up after the hunter, never under a half-typed message.
    const greeting = hunt.roles.length ? GREETINGS.roles : GREETINGS.none;
    const [spokenLine, setSpokenLine] = useState("");
    const finishSpeaking = useCallback(() => setSpokenLine(greeting), [greeting]);
    const spoken = spokenLine === greeting;

    const openEditor = useCallback(() => setEditing(true), []);
    const closeEditor = useCallback(() => setEditing(false), []);
    const saveHunt = useCallback((next) =>
      {
        setHunt(next);
        setEditing(false);
      }, []);

    return (
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5 pt-2 pb-10 sm:pt-6">
        {/* A new greeting remounts the message, so saving your first roles has the hunter answer with the next line. */}
        <AgentMessage key={greeting} text={greeting} onDone={finishSpeaking} />
        {spoken && <RolesBox roles={hunt.roles} details={detailsOf(hunt)} onEdit={openEditor} />}

        <HuntPreferences open={editing} hunt={hunt} firstTime={!hunt.roles.length} onClose={closeEditor} onSave={saveHunt} />
      </div>
    );
  }
