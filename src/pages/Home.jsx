import { useEffect, useState } from "react";
import { getHealth } from "../services/api.js";

export default function Home()
  {
    const [health, setHealth] = useState(null);
    const [error, setError] = useState("");

    // Pinging the API once on load so you can tell straight away if the two halves are talking.
    useEffect(() =>
      {
        let cancelled = false;

        getHealth()
          .then((data) =>
            {
              if(!cancelled) setHealth(data);
            })
          .catch((err) =>
            {
              if(!cancelled) setError(err.message);
            });

        return () => (cancelled = true);
      }, []);

    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to SleekBoard</h1>
        <p className="text-gray-600 dark:text-gray-400">React on the front, Express and Mongo on the back. Swap this page out when you're ready.</p>

        <div className="rounded-xl border border-gray-200 p-4 text-sm dark:border-gray-800">
          <p className="font-medium">API status</p>
          {error && <p className="mt-1 text-red-600">Couldn't reach the API: {error}</p>}
          {!error && !health && <p className="mt-1 text-gray-500">Checking...</p>}
          {health && <p className="mt-1 text-gray-500">{health.status} · database {health.database}</p>}
        </div>
      </section>
    );
  }
