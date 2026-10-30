import { useEffect } from "react";
import { getRun } from "../../../services/api.js";

const LIVE = ["queued", "running"];

export const isLive = (run) => Boolean(run) && LIVE.includes(run.status);

// Asks the server how a run is doing about once a second, until it ends, and hands each answer to onUpdate. The next
// ask only goes out once the last one is back, so a slow server never piles them up. A missed ask is fine; the next
// one tries again.
export default function useRun(run, onUpdate)
  {
    const id = run?.id;
    const live = isLive(run);

    useEffect(() =>
      {
        if(!live) return;
        let stopped = false;
        let timer;
        const ask = async () =>
          {
            try
              {
                const fresh = await getRun(id);
                if(!stopped) onUpdate(fresh);
              }
            catch
              {
                // Try again on the next tick.
              }
            if(!stopped) timer = setTimeout(ask, 1000);
          };
        timer = setTimeout(ask, 1000);
        return () =>
          {
            stopped = true;
            clearTimeout(timer);
          };
      }, [id, live, onUpdate]);
  }
