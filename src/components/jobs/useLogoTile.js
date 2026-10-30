import { useEffect, useState } from "react";
import { tileOf } from "./logos.js";

// The tile a logo sits on: "light", "dark", or null for none. undefined while the logo is still being read, so the mark
// can wait instead of showing bare and then jumping onto a tile. Reads are cached in logos.js, so a board of cards only
// reads each logo once.
export default function useLogoTile(logo)
  {
    const [read, setRead] = useState({ logo: null, tile: undefined });

    useEffect(() =>
      {
        let live = true;
        tileOf(logo).then((tile) => live && setRead({ logo, tile }));
        return () =>
          {
            live = false;
          };
      }, [logo]);

    // A tile read for the previous logo doesn't count for this one.
    return read.logo === logo ? read.tile : undefined;
  }
