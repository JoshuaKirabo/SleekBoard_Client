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

// Sidebar on the left, header across the top, and whichever page is open fills the rest.
export default function Layout()
  {
    const { pathname } = useLocation();
    const title = TITLES[pathname] || "Not found";

    return (
      <div className="flex min-h-dvh flex-col bg-canvas text-ink lg:flex-row">
        <Sidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header title={title} />
          <main className="flex flex-1 flex-col p-5 sm:p-7">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }
