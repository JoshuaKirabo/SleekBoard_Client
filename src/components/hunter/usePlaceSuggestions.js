import { useEffect, useMemo, useState } from "react";
import { placeSearch, REMOTE_WAIT } from "./placeSearch.js";

// One empty list, so the memos below don't redo their work for a fresh [] each render.
const NONE = [];

// The places to offer for what's typed: our own list straight away, Photon's joining it once typing pauses. A reply
// for words you've since changed is thrown away. Nothing is asked while `on` is false.
export default function usePlaceSuggestions(query, picked, on)
  {
    const [found, setFound] = useState({ query: "", places: [] });
    const local = useMemo(() => (on ? placeSearch.local(query) : NONE), [on, query]);

    useEffect(() =>
      {
        if(!on || !placeSearch.asksRemote(query)) return;
        let live = true;
        const timer = setTimeout(() =>
          {
            placeSearch.remote(query).then((places) => live && setFound({ query, places }));
          }, REMOTE_WAIT);
        return () =>
          {
            live = false;
            clearTimeout(timer);
          };
      }, [on, query]);

    const remote = on && found.query === query ? found.places : NONE;
    return useMemo(() => placeSearch.merge(local, remote, picked), [local, remote, picked]);
  }
