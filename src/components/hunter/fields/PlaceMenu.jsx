// The places under the Location box: the place on the left, its country quieter on the right. Mouse presses inside
// are kept from taking focus, so the box stays ready to type. Pointing at a row highlights it, the same as the arrows.
export default function PlaceMenu({ id, places, active, onPoint, onPick })
  {
    return (
      <ul id={id} role="listbox" onMouseDown={(event) => event.preventDefault()} className="role-menu lane-scroll absolute inset-x-0 top-full z-20 mt-2 max-h-[340px] overflow-y-auto rounded-2xl bg-raised p-1.5 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.75)]">
        {places.map((place, index) => (
          <li
            key={place.value}
            id={`${id}-${index}`}
            role="option"
            aria-selected={index === active}
            onPointerEnter={(event) => event.pointerType === "mouse" && onPoint(index)}
            onClick={() => onPick(place)}
            className={`flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-[14px] transition-colors duration-100 ${index === active ? "bg-white/[0.07] text-ink" : "text-ink-2"}`}
          >
            <span className="leading-snug font-medium">{place.label}</span>
            {place.country && <span className="shrink-0 text-[12.5px] text-ink-3">{place.country}</span>}
          </li>
        ))}
      </ul>
    );
  }
