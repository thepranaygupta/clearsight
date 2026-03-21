import { cn } from "@/lib/utils";

interface WcagPillProps {
  criterion: string;
  level?: string;
  className?: string;
}

export function WcagPill({ criterion, level, className }: WcagPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground",
        className
      )}
    >
      {criterion}
      {level && <span className="text-muted-foreground/50">{level}</span>}
    </span>
  );
}
