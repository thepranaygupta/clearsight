"use client";

interface Priority {
  issueId: string;
  title: string;
  reason: string;
}

interface TopPrioritiesProps {
  priorities: Priority[];
}

export function TopPriorities({ priorities }: TopPrioritiesProps) {
  if (priorities.length === 0) return null;

  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Top Priorities
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {priorities.map((priority, index) => (
          <div
            key={priority.issueId}
            className="flex items-start gap-3.5 rounded-xl border border-border/60 bg-card p-4"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
              {index + 1}
            </span>
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-medium leading-snug text-foreground">
                {priority.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {priority.reason}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
