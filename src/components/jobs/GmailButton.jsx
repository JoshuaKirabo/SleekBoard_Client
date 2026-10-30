import { useEffect, useState } from "react";
import { MailIcon } from "../icons.jsx";
import { gmailConnectUrl } from "../../services/api.js";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";
const pill = `flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-[background-color,color] duration-150 ${focusRing}`;

// Gmail's spot in the toolbar. Not connected, it's a link that goes to Google and comes back. Google cuts a testing
// app's login off after 7 days, and then it asks you to reconnect in cream so it stands out. Connected, it shows a
// small sage dot; pressing it once turns it into "Disconnect Gmail?" and the second press does it, the same two
// clicks as deleting a job, and it calms back down after three seconds.
export default function GmailButton({ gmail, onDisconnect })
  {
    const [armed, setArmed] = useState(false);

    useEffect(() =>
      {
        if(!armed) return;
        const timer = setTimeout(() => setArmed(false), 3000);
        return () => clearTimeout(timer);
      }, [armed]);

    if(!gmail) return null;

    if(!gmail.configured)
      {
        return (
          <span title="Add GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET and GMAIL_SECRET to the server's .env" className="flex h-9 items-center gap-1.5 rounded-full bg-surface px-3 text-[13px] text-ink-3">
            <MailIcon size={15} />
            <span className="hidden xl:inline">Gmail not set up</span>
          </span>
        );
      }

    if(gmail.status !== "connected")
      {
        const expired = gmail.status === "expired";
        return (
          <a href={gmailConnectUrl} className={`${pill} ${expired ? "bg-cream/15 text-cream hover:bg-cream/25" : "bg-surface text-ink-2 hover:bg-raised hover:text-ink"}`}>
            <MailIcon size={15} />
            {expired ? "Reconnect Gmail" : "Connect Gmail"}
          </a>
        );
      }

    return (
      <button
        type="button"
        onClick={() => (armed ? onDisconnect() : setArmed(true))}
        title={armed ? undefined : `Connected as ${gmail.address || "your Gmail"}. Replies move your cards within a minute.`}
        aria-label={armed ? "Click again to disconnect Gmail" : `Gmail connected as ${gmail.address || "your Gmail"}`}
        className={`${pill} ${armed ? "bg-halt/15 text-halt hover:bg-halt/25" : "bg-surface text-ink-2 hover:bg-raised hover:text-ink"}`}
      >
        <MailIcon size={15} />
        {armed ? "Disconnect Gmail?" : <span className="hidden xl:inline">Gmail</span>}
        {!armed && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-go" />}
      </button>
    );
  }
