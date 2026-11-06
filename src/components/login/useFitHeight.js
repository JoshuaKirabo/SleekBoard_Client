import { useLayoutEffect, useState } from "react";

// How much to shrink the login card so it fits its column top to bottom. The login page never scrolls (Josh), so on a
// window too short for the card at full size, say a laptop with the dock up or a phone on its side, the whole card
// scales down from its top edge rather than running off the bottom. 1 whenever it already fits, which is most windows.
export default function useFitHeight(column, card)
  {
    const [scale, setScale] = useState(1);

    useLayoutEffect(() =>
      {
        // Room is what's left of the column under the card's top edge, less the column's bottom padding. The card's own
        // height is read untransformed, so scaling it never feeds back into the next measurement.
        const measure = () =>
          {
            const room = column.current.clientHeight - card.current.offsetTop - parseFloat(getComputedStyle(column.current).paddingBottom);
            setScale(Math.min(1, room / card.current.offsetHeight));
          };
        measure();
        const watcher = new ResizeObserver(measure);
        watcher.observe(column.current);
        watcher.observe(card.current);
        return () => watcher.disconnect();
      }, [column, card]);

    return scale;
  }
