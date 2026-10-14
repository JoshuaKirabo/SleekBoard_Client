import { NavLink, Link } from "react-router-dom";
import wordmark from "../assets/brand/wordmark-white.svg";
import { GridIcon, ChatIcon, ResumeIcon, JobsIcon, ApplicationIcon, ChartIcon } from "./icons.jsx";

// Same six items as the reference screen. Only Analytics has a page so far, the rest land on 404 until built.
const NAV = [
  { to: "/dashboard", label: "Dashboard", Icon: GridIcon },
  { to: "/chat", label: "Chat", Icon: ChatIcon },
  { to: "/resume", label: "Resume", Icon: ResumeIcon },
  { to: "/jobs", label: "Jobs", Icon: JobsIcon },
  { to: "/application", label: "Application", Icon: ApplicationIcon },
  { to: "/", label: "Analytics", Icon: ChartIcon },
];

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream";

// The active row gets a raised pill and a thin cream bar on its left edge. Below lg the nav is a horizontal strip,
// so the bar is dropped there and the pill carries the state on its own. Press tint lands on pointer-down, not release.
const navClass = ({ isActive }) =>
  `relative flex h-10 shrink-0 items-center gap-3 rounded-lg px-3 text-[13px] font-medium transition-colors duration-150 ${focusRing} ${
    isActive
      ? "bg-raised text-ink before:absolute before:top-2.5 before:bottom-2.5 before:left-0 before:hidden before:w-0.5 before:rounded-full before:bg-cream lg:before:block"
      : "text-ink-2 hover:bg-white/[0.04] hover:text-ink active:bg-white/[0.08] active:text-ink"
  }`;

// On the strip the last item fades at the right edge so it reads as scrollable instead of cut off.
const stripMask = "max-lg:[mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)] max-lg:[scrollbar-width:none]";

export default function Sidebar()
  {
    return (
      <aside className="flex w-full flex-col border-b border-line lg:w-[232px] lg:shrink-0 lg:border-r lg:border-b-0">
        {/* The logo row keeps its own bottom line so it meets the header's and the two dividers cross. */}
        <div className="flex h-[76px] shrink-0 items-center px-6 lg:border-b lg:border-line">
          <Link to="/" aria-label="SleekBoard, go to Analytics" className={`rounded-sm ${focusRing}`}>
            <img src={wordmark} alt="" className="h-[17px] w-auto" />
          </Link>
        </div>

        <nav aria-label="Main" className="px-3 pb-3 lg:pt-3">
          <ul className={`flex gap-1 overflow-x-auto lg:flex-col ${stripMask}`}>
            {NAV.map(({ to, label, Icon }) => (
              <li key={to}>
                <NavLink to={to} end={to === "/"} className={navClass}>
                  <Icon size={17} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    );
  }
