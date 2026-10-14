import { useEffect, useState } from "react";
import { tintOf } from "./logos.js";

// The brand colour of a logo as an "r g b" string, or null until it's known or if there isn't one. Results are cached
// in logos.js, so a lane of cards only samples each logo once.
export default function useLogoTint(logo)
  {
    const [tint, setTint] = useState(null);

    useEffect(() =>
      {
        let live = true;
        tintOf(logo).then((found) => live && setTint(found));
        return () =>
          {
            live = false;
          };
      }, [logo]);

    return tint;
  }
