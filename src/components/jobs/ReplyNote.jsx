import { useState } from "react";
import { MailIcon } from "../icons.jsx";
import { statusById } from "./statuses.js";
import { decideReplySuggestion, problemOf } from "../../services/api.js";
import { mainButton, quietButton } from "./contacts/buttons.js";

// When a reply landed, as "30 Oct, 14:05".
export const replyTime = (iso) =>
  {
    if(!iso) return "";
    const date = new Date(iso);
    return `${date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}, ${date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  };

// The panel's view of the last reply from this company. When the AI wasn't sure enough to move the card, it says
// where it thinks the card goes and waits for you: Move does it (and the move can be undone like any other), Not now
// clears it. Under that, the start of the reply itself, so you can see why without opening Gmail.
export default function ReplyNote({ job, onJobChange })
  {
    const [busy, setBusy] = useState("");
    const [problem, setProblem] = useState("");
    const suggestion = job.replySuggestion;
    if(!suggestion && !job.replySnippet) return null;

    const lane = suggestion ? statusById(suggestion.to)?.label || suggestion.to : "";

    const decide = async (decision) =>
      {
        setBusy(decision);
        setProblem("");
        try
          {
            onJobChange(await decideReplySuggestion(job.id, decision));
          }
        catch(error)
          {
            setProblem(problemOf(error));
          }
        finally
          {
            setBusy("");
          }
      };

    return (
      <section aria-label="Last reply" className="mt-7 rounded-xl bg-raised/60 p-4">
        <div className="flex items-center gap-2 text-[12px] text-ink-3">
          <MailIcon size={14} />
          <span>Reply in Gmail{job.replyAt ? ` · ${replyTime(job.replyAt)}` : ""}</span>
        </div>

        {suggestion && (
          <div className="mt-3">
            <p className="text-[14px] text-ink">This reply looks like {lane}.</p>
            <div className="mt-3 flex items-center gap-1">
              <button type="button" disabled={Boolean(busy)} onClick={() => decide("accept")} className={mainButton}>
                {busy === "accept" ? "Moving…" : `Move to ${lane}`}
              </button>
              <button type="button" disabled={Boolean(busy)} onClick={() => decide("dismiss")} className={quietButton}>
                Not now
              </button>
            </div>
            {problem && <p className="mt-2 text-[12px] text-halt">{problem}</p>}
          </div>
        )}

        {job.replySnippet && <p className="mt-3 text-[13px] leading-relaxed text-ink-2 italic">“{job.replySnippet}”</p>}
      </section>
    );
  }
