// Every tile on the dashboard shares this shell so spacing and corners match across the grid.
export default function Card({ title, action, className = "", children })
  {
    return (
      <section className={`flex flex-col rounded-2xl border border-line bg-surface p-5 ${className}`}>
        {title && (
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[15px] font-semibold">{title}</h2>
            {action}
          </div>
        )}
        {children}
      </section>
    );
  }
