import { useEffect, useState } from "react";
import { logoFor } from "./logos.js";
import useLogoTile from "./useLogoTile.js";

// What sits behind a logo that has no background of its own. White for a dark or coloured mark, black for a light one.
const TILES = { light: "bg-white", dark: "bg-black" };

// The company's logo, or its first letter when there isn't one. A logo that comes with its own square (Vercel,
// Notion) shows as it is. One with a see-through background, like Intel's blue wordmark, is set on a solid tile with
// room around it, so every logo reads as the same kind of square. Pass a job and it works out the image itself; pass
// "logo" straight in when there is no job yet, like the add sheet's preview. A logo that fails to load flips to the
// letter and stays there until the source changes.
export default function CompanyMark({ job, name = job?.company || "", logo, size = "h-8 w-8 text-[13px]", radius = "rounded-lg", fallback = "bg-raised" })
  {
    const src = logo !== undefined ? logo : job ? logoFor(job) : null;
    const [broken, setBroken] = useState(false);
    const tile = useLogoTile(src);

    useEffect(() => setBroken(false), [src]);

    if(src && !broken)
      {
        // Held back, not shown bare, until we know whether it needs a tile. The read is cached, so that's only the
        // first time a logo is seen.
        const waiting = tile === undefined;
        const image = <img src={src} alt="" onError={() => setBroken(true)} draggable="false" aria-hidden="true" className={tile ? "h-[70%] w-[70%] object-contain" : `company-mark shrink-0 object-cover ${radius} ${size} transition-opacity duration-150 ${waiting ? "opacity-0" : "opacity-100"}`} />;
        if(!tile) return image;
        return (
          <span data-tile={tile} aria-hidden="true" className={`company-mark flex shrink-0 items-center justify-center overflow-hidden ${TILES[tile]} ${radius} ${size}`}>
            {image}
          </span>
        );
      }

    return (
      <span data-fallback="" className={`company-mark flex shrink-0 items-center justify-center font-semibold text-ink ${radius} ${fallback} ${size}`} aria-hidden="true">
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
