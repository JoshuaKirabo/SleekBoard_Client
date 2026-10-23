import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";

// Header title per route. Unknown routes land on the 404 page, so they get that title.
const TITLES =
  {
    "/": "Analytics",
    "/dashboard": "Dashboard",
    "/chat": "Chat",
    "/resume": "Resume",
    "/jobs": "Jobs",
    "/application": "Application",
  };

// Pages that are held to the height of the window instead of growing past it. The jobs board is one: the whole
// pipeline should be in view at once, and a long lane scrolls inside itself rather than pushing the page down.
const FIT_TO_WINDOW = new Set(["/jobs"]);

// Sidebar on the left, header across the top, and whichever page is open fills the rest.
export default function Layout()
  {
    const { pathname } = useLocation();
    const title = TITLES[pathname] || "Not found";
    const fit = FIT_TO_WINDOW.has(pathname);

    return (
      <div className={`flex flex-col bg-canvas text-ink lg:flex-row ${fit ? "h-dvh overflow-hidden" : "min-h-dvh"}`}>
        <Sidebar />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <Header title={title} />
          <main className="flex min-h-0 flex-1 flex-col p-5 sm:p-7">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }
