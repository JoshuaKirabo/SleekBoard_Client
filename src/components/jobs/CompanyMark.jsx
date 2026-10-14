import { useEffect, useState } from "react";
import { logoFor } from "./logos.js";

// The company's logo, or its first letter when there isn't one. The logo sits straight on the card with rounded
// corners and nothing behind it; only the letter gets the raised square. Pass a job and it works out the image
// itself; pass "logo" straight in when there is no job yet, like the add sheet's preview. A logo that fails to load
// flips to the letter and stays there until the source changes.
export default function CompanyMark({ job, name = job?.company || "", logo, size = "h-8 w-8 text-[13px]", radius = "rounded-lg", fallback = "bg-raised" })
  {
    const src = logo !== undefined ? logo : job ? logoFor(job) : null;
    const [broken, setBroken] = useState(false);

    useEffect(() => setBroken(false), [src]);

    if(src && !broken)
      {
        return <img src={src} alt="" onError={() => setBroken(true)} draggable="false" className={`company-mark shrink-0 object-cover ${radius} ${size}`} aria-hidden="true" />;
      }

    return (
      <span data-fallback="" className={`company-mark flex shrink-0 items-center justify-center font-semibold text-ink ${radius} ${fallback} ${size}`} aria-hidden="true">
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
