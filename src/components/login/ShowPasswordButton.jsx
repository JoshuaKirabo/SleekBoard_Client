import { EyeIcon, EyeOffIcon } from "../icons.jsx";

const buttonClass = "absolute right-1 bottom-[3px] grid cursor-pointer place-items-center rounded-full text-ink-3 transition-colors duration-200 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

// The eye at the end of the password pill. It shows or hides what you typed. Pressing it with the mouse keeps the caret
// in the field, so you can carry on typing. Screen readers hear one name, "Show password", that reads as pressed or not.
// compact is for the sign-up page's slimmer pills.
export default function ShowPasswordButton({ shown, onToggle, controls, compact = false })
  {
    return (
      <button
        type="button"
        aria-label="Show password"
        aria-pressed={shown}
        aria-controls={controls}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onToggle}
        className={`${buttonClass} ${compact ? "size-9" : "size-10"}`}
      >
        {shown ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
      </button>
    );
  }
