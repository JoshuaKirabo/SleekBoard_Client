import { useRef, useState } from "react";
import { importConnections, clearConnections, problemOf } from "../../../services/api.js";
import { UploadIcon, ArrowUpRightIcon } from "../../icons.jsx";
import { focusRing, quietButton } from "./buttons.js";
import { shortDate } from "./contactText.js";

// The server takes up to 8 MB, far past a big network's export.
const MAX_BYTES = 8 * 1024 * 1024;

// What an upload did, in one line: how many came in and how many rows were skipped.
const importLine = ({ count, quality }) =>
  {
    const skipped = (quality?.noCompany || 0) + (quality?.noName || 0);
    return `${count.toLocaleString("en-US")} connections added${skipped ? `, ${skipped} skipped with no name or company` : ""}.`;
  };

// Your LinkedIn connections, so warm leads can include them: upload LinkedIn's Connections.csv, replace it, or forget
// it. Also LinkedIn's own search for 2nd-degree connections, since the export only has your 1st-degree ones.
export default function ConnectionsBar({ summary, secondDegreeSearch, onChange })
  {
    const input = useRef(null);
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    const upload = async (file) =>
      {
        if(!file) return;
        if(file.size > MAX_BYTES)
          {
            setMessage("That file is over 8 MB. It should be LinkedIn's Connections.csv.");
            return;
          }
        setBusy(true);
        try
          {
            setMessage(importLine(await importConnections(await file.text())));
            onChange();
          }
        catch(error)
          {
            setMessage(problemOf(error));
          }
        finally
          {
            setBusy(false);
            input.current.value = "";
          }
      };

    const forget = async () =>
      {
        try
          {
            await clearConnections();
            setMessage("Your connections are gone. Contacts you already saved from them stay.");
            onChange();
          }
        catch(error)
          {
            setMessage(problemOf(error));
          }
      };

    const count = summary?.count || 0;

    return (
      <div className="mt-4 text-[12px] text-ink-3">
        <input ref={input} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => upload(event.target.files?.[0])} />
        {count
          ? <p>{count.toLocaleString("en-US")} LinkedIn connections, uploaded {shortDate(summary.importedAt)}.</p>
          : <p>Add your LinkedIn connections to see who you already know here. On LinkedIn: Settings, Data privacy, Get a copy of your data, Connections.</p>}
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <button type="button" disabled={busy} onClick={() => input.current.click()} className={`${quietButton} -ml-2.5`}>
            <UploadIcon size={13} />
            {busy ? "Uploading…" : count ? "Replace Connections.csv" : "Upload Connections.csv"}
          </button>
          {count > 0 && <button type="button" onClick={forget} className={quietButton}>Forget them</button>}
          {secondDegreeSearch && (
            <a href={secondDegreeSearch} target="_blank" rel="noreferrer" className={`flex h-8 items-center gap-1 rounded-full px-2.5 text-[13px] font-medium text-ink-3 transition-colors duration-150 hover:text-ink ${focusRing}`}>
              2nd-degree on LinkedIn
              <ArrowUpRightIcon size={13} />
            </a>
          )}
        </div>
        {message && <p className="mt-1 text-ink-2" role="status">{message}</p>}
      </div>
    );
  }
