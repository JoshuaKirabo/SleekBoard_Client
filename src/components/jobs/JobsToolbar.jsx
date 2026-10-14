import { BoardIcon, TableIcon, SearchIcon, FilterIcon, PlusIcon } from "../icons.jsx";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

const VIEWS = [
  { id: "board", label: "Board", Icon: BoardIcon },
  { id: "table", label: "Table", Icon: TableIcon },
];

// View switcher on the left, search and the add button on the right. The switcher is a segmented control with one
// sliding pill, so changing views feels like moving a thing instead of swapping two buttons.
export default function JobsToolbar({ view, onView, query, onQuery, total, onAdd })
  {
    const activeIndex = VIEWS.findIndex((item) => item.id === view);

    return (
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="View" className="relative grid h-9 grid-cols-2 rounded-full bg-surface p-1">
          <span
            aria-hidden="true"
            className="absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-raised transition-transform duration-200 ease-out"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          />
          {VIEWS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={view === id}
              onClick={() => onView(id)}
              className={`relative z-10 flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-3.5 text-[13px] font-medium transition-colors duration-150 ${focusRing} ${view === id ? "text-ink" : "text-ink-2 hover:text-ink"}`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <p className="text-[13px] text-ink-3 tabular-nums">{total} applications</p>

        <div className="ml-auto flex items-center gap-2">
          <label className="relative block">
            <span className="sr-only">Search jobs</span>
            <SearchIcon size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3" />
            <input
              type="search"
              value={query}
              onChange={(event) => onQuery(event.target.value)}
              placeholder="Search company or role"
              className={`h-9 w-44 rounded-full bg-surface pr-3 pl-9 text-[13px] text-ink placeholder:text-ink-3 transition-[width,background-color] duration-200 focus:w-60 focus:bg-raised focus:outline-none sm:w-52 ${focusRing}`}
            />
          </label>

          <button type="button" className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-surface text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink ${focusRing}`} aria-label="Filter">
            <FilterIcon size={15} />
          </button>

          <button type="button" onClick={onAdd} className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-ink pr-4 pl-3 text-[13px] font-semibold text-canvas transition-[opacity,transform] duration-100 hover:opacity-90 active:scale-[0.97] ${focusRing} focus-visible:outline-ink`}>
            <PlusIcon size={15} />
            Add job
          </button>
        </div>
      </div>
    );
  }
