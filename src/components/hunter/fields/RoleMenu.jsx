import { useState } from "react";
import { CheckIcon, ChevronRightIcon } from "../../icons.jsx";
import { ALL_ROLES, ROLE_CATALOG, searchCatalog } from "../roleCatalog.js";
import { focusRing } from "./styles.js";

// One role you can tap on or off. Picked ones take the cream and a tick, the same as the picks in the box above.
function RoleChip({ role, picked, onToggle })
  {
    return (
      <button type="button" aria-pressed={picked} onClick={() => onToggle(role)} className={`flex min-h-8 cursor-pointer items-center gap-1 rounded-[16px] px-3 py-1 text-left text-[13.5px] leading-snug font-medium transition-[background-color,color,scale] duration-150 ease-out-strong active:scale-[0.96] ${picked ? "bg-cream/[0.12] text-cream" : "bg-white/[0.05] text-ink-2 hover:bg-white/[0.1] hover:text-ink"} ${focusRing}`}>
        {picked && <CheckIcon size={13} strokeWidth={2.4} className="tag-pop -ml-0.5" />}
        {role}
      </button>
    );
  }

function RoleGroup({ name, roles, values, onToggle })
  {
    return (
      <div>
        <h5 className="text-[13px] font-semibold text-ink">{name}</h5>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {roles.map((role) => <RoleChip key={role} role={role} picked={values.includes(role)} onToggle={onToggle} />)}
        </div>
      </div>
    );
  }

// Browsing: fields down the left, the chosen field's roles on the right. Pointing at a field opens it, so you can
// skim the list without clicking; clicking or tabbing onto one does the same.
function Browse({ values, onToggle })
  {
    const [open, setOpen] = useState(ROLE_CATALOG[0].name);
    const field = ROLE_CATALOG.find((item) => item.name === open);
    const pickedIn = (item) => item.groups.reduce((sum, group) => sum + group.roles.filter((role) => values.includes(role)).length, 0);

    return (
      <div className="flex max-h-[420px] min-h-0">
        <ul className="lane-scroll w-[44%] shrink-0 overflow-y-auto p-1.5 sm:w-[250px]" aria-label="Fields">
          {ROLE_CATALOG.map((item) =>
            {
              const on = item.name === open;
              const count = pickedIn(item);
              return (
                <li key={item.name}>
                  <button type="button" onPointerEnter={(event) => event.pointerType === "mouse" && setOpen(item.name)} onFocus={() => setOpen(item.name)} onClick={() => setOpen(item.name)} aria-expanded={on} className={`flex min-h-10 w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-[14px] font-medium transition-colors duration-100 ${on ? "bg-white/[0.07] text-ink" : "text-ink-2 hover:text-ink"} ${focusRing}`}>
                    <span className="leading-snug">{item.name}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      {count > 0 && <span className="text-[12.5px] font-semibold text-cream tabular-nums">{count}</span>}
                      <ChevronRightIcon size={14} className="text-ink-3" />
                    </span>
                  </button>
                </li>
              );
            })}
        </ul>

        <div className="lane-scroll min-w-0 flex-1 space-y-5 overflow-y-auto bg-white/[0.025] p-4">
          {field.groups.map((group) => <RoleGroup key={group.name} name={group.name} roles={group.roles} values={values} onToggle={onToggle} />)}
        </div>
      </div>
    );
  }

// Searching: every role that contains what you typed, under its field. Nothing matching isn't a dead end, since
// Enter adds your own words.
function Results({ query, values, onToggle })
  {
    const fields = searchCatalog(query);
    const typed = query.trim();
    const listed = ALL_ROLES.some((role) => role.toLowerCase() === typed.toLowerCase());

    return (
      <div className="lane-scroll max-h-[420px] space-y-5 overflow-y-auto p-4">
        {fields.map((field) => <RoleGroup key={field.name} name={field.name} roles={field.roles} values={values} onToggle={onToggle} />)}
        {!listed && (
          <p className="text-[13px] text-ink-3">
            Press Enter to add “<span className="text-ink-2">{typed}</span>” as you typed it.
          </p>
        )}
      </div>
    );
  }

// The menu under the roles box. Mouse presses inside it are kept from taking focus, so the box stays ready to type
// and half-typed words aren't added by accident.
export default function RoleMenu({ query, values, onToggle })
  {
    return (
      <div onMouseDown={(event) => event.preventDefault()} className="role-menu absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl bg-raised shadow-[0_24px_60px_-12px_rgba(0,0,0,0.75)]">
        {query.trim() ? <Results query={query} values={values} onToggle={onToggle} /> : <Browse values={values} onToggle={onToggle} />}
      </div>
    );
  }
