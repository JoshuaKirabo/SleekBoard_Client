import { Link } from "react-router-dom";

export default function NotFound()
  {
    return (
      <section className="space-y-3 text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="text-gray-600 dark:text-gray-400">That page doesn't exist.</p>
        <Link to="/" className="text-violet-600 underline">Back home</Link>
      </section>
    );
  }
