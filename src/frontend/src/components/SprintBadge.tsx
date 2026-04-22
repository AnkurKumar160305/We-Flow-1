import { cn } from "@/lib/utils";
import type { SprintStatus } from "../types";

interface SprintBadgeProps {
  status: SprintStatus;
  name?: string;
  className?: string;
}

export function SprintBadge({ status, name, className }: SprintBadgeProps) {
  if (status === "active") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground",
          className,
        )}
        data-ocid="sprint-live-badge"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary-foreground" />
        </span>
        {name ? `${name} · Live` : "Live"}
      </span>
    );
  }

  if (status === "upcoming") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground",
          className,
        )}
      >
        {name ? `${name} · Upcoming` : "Upcoming"}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-muted text-muted-foreground line-through",
        className,
      )}
    >
      {name ? `${name} · Completed` : "Completed"}
    </span>
  );
}
