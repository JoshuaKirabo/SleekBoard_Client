import { HunterIcon, PlusIcon } from "../icons.jsx";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";
const pressable = `cursor-pointer transition-[background-color,color,scale] duration-150 ease-out-strong active:scale-[0.97] ${focusRing}`;

// Chips past this many all arrive together, so a long list never makes you wait for its tail.
const STAGGER_CAP = 14;

// One preference as a pill. Roles are cream so they lead; the rest (job type, work model, where) sit quieter.
function Chip({ label, index, quiet })
  {
    const tone = quiet ? "bg-raised text-ink-2" : "bg-cream/[0.09] text-cream";
    return (
      <li className={`hunt-chip flex min-h-9 items-center rounded-[18px] px-3.5 py-1.5 text-center text-[14px] leading-snug font-medium ${tone}`} style={{ "--i": Math.min(index, STAGGER_CAP) }}>
        {label}
      </li>
    );
  }

// What the hunter is looking for, shown back to you to confirm, with Hunt to send it off.
function RolesList({ roles, details, onEdit, onHunt, hunting })
  {
    return (
      <>
        <ul className="flex flex-wrap justify-center gap-2" aria-label="Roles">
          {roles.map((role, index) => <Chip key={role} label={role} index={index} />)}
        </ul>

        {details.length > 0 && (
          <ul className="mt-2 flex flex-wrap justify-center gap-2" aria-label="Job type, work model and location">
            {details.map((detail, index) => <Chip key={detail} label={detail} index={roles.length + index} quiet />)}
          </ul>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onEdit} className={`flex h-9 items-center rounded-full bg-raised px-4 text-[13.5px] font-medium text-ink hover:bg-white/[0.12] ${pressable}`}>
            Edit roles
          </button>
          <button type="button" onClick={onHunt} disabled={hunting} className={`flex h-9 items-center gap-1.5 rounded-full bg-cream pr-4 pl-3 text-[13.5px] font-semibold text-canvas hover:bg-ink disabled:cursor-default disabled:bg-raised disabled:text-ink-2 disabled:active:scale-100 ${pressable}`}>
            <HunterIcon size={16} />
            {hunting ? "Hunting" : "Hunt"}
          </button>
        </div>
      </>
    );
  }

// Nothing to hunt for yet. The hunter has already asked, so the box is just the way to answer.
function NoRoles({ onAdd })
  {
    return (
      <div className="flex justify-center py-6">
        <button type="button" onClick={onAdd} className={`flex h-10 items-center gap-1.5 rounded-full bg-cream pr-4.5 pl-3.5 text-[14px] font-semibold text-canvas hover:bg-ink ${pressable}`}>
          <PlusIcon size={16} />
          Add roles
        </button>
      </div>
    );
  }

// The box under the hunter's message. It comes up once the hunter has finished talking: your roles if you have
// some, an Add roles prompt if you don't.
export default function RolesBox({ roles, details, onEdit, onHunt, hunting })
  {
    return (
      <section className="hunt-rise w-full rounded-3xl bg-surface p-5 sm:p-7">
        {roles.length > 0 ? <RolesList roles={roles} details={details} onEdit={onEdit} onHunt={onHunt} hunting={hunting} /> : <NoRoles onAdd={onEdit} />}
      </section>
    );
  }
