import { useNavigate } from "react-router-dom";
import { flushSync } from "react-dom";

// Moving between the login screen and the app. The browser snapshots the screen you're leaving, we swap the route,
// and index.css animates the two snapshots. "in" is login to the app, "out" is the app back to login, and the CSS
// plays one as the mirror of the other. Browsers without view transitions just change the page.
export default function useScreenSwap()
  {
    const navigate = useNavigate();

    return (to, direction) =>
      {
        if(!document.startViewTransition) return navigate(to);

        const root = document.documentElement;
        root.dataset.swap = direction;

        // flushSync so the new screen is on the page before the browser takes its second snapshot.
        const swap = document.startViewTransition(() => flushSync(() => navigate(to)));
        swap.finished.finally(() => delete root.dataset.swap);
      };
  }
