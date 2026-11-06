import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getMe, problemOf } from "../../services/api.js";
import { SessionContext } from "./session.js";

// The door to the app. Asks the server who's signed in: nobody goes to /login, someone gets the app with their
// account handed down. While it asks, only the empty canvas shows, so the board never flashes up for a signed-out
// visitor. The server checks every request on its own too; this just keeps you off pages that would only get 401s.
export default function SignedIn()
  {
    const [state, setState] = useState({ status: "checking" });

    useEffect(() =>
      {
        let current = true;
        getMe()
          .then((user) => current && setState(user ? { status: "in", user } : { status: "out" }))
          .catch((error) => current && setState({ status: "down", problem: problemOf(error) }));
        return () =>
          {
            current = false;
          };
      }, []);

    if(state.status === "out") return <Navigate to="/login" replace />;
    if(state.status === "down") return <p className="flex min-h-dvh items-center justify-center bg-canvas px-6 text-center text-sm text-ink-2">{state.problem}</p>;
    if(state.status === "checking") return <div className="min-h-dvh bg-canvas" aria-busy="true" />;

    return (
      <SessionContext.Provider value={state.user}>
        <Outlet />
      </SessionContext.Provider>
    );
  }
