import { Link } from "react-router-dom";

export default function NotFound()
  {
    return (
      <section className="space-y-3 py-16 text-center">
        <h1 className="text-4xl font-semibold">404</h1>
        <p className="text-ink-2">That page doesn't exist yet.</p>
        <Link to="/" className="inline-block rounded-sm font-medium text-cream underline underline-offset-4 transition-colors duration-150 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream">Back to Analytics</Link>
      </section>
    );
  }
