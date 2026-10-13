import { Link, Outlet } from "react-router-dom";

export default function Layout()
  {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <header className="border-b border-gray-200 dark:border-gray-800">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link to="/" className="text-lg font-semibold tracking-tight">SleekBoard</Link>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
          <Outlet />
        </main>

        <footer className="border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-500 dark:border-gray-800">
          SleekBoard
        </footer>
      </div>
    );
  }
