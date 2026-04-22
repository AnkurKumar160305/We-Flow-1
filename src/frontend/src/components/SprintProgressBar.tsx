import { cn } from "@/lib/utils";
import type { Sprint, Task, WorkspaceMember } from "../types";

interface SprintProgressBarProps {
  sprint: Sprint;
  tasks: Task[];
  members: WorkspaceMember[];
  /** The id of the current user — shown as "You" */
  currentUserId?: string;
}

// Avatar color palette — cycles by index
const AVATAR_COLORS = [
  "bg-orange-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-teal-500",
  "bg-pink-500",
  "bg-green-500",
];

function formatSprintDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function SprintProgressBar({
  sprint,
  tasks,
  members,
  currentUserId = "user-1",
}: SprintProgressBarProps) {
  const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id);
  const total = sprintTasks.length;

  const doneCount = sprintTasks.filter((t) => t.status === "done").length;
  const inProgressCount = sprintTasks.filter(
    (t) => t.status === "doing",
  ).length;
  const todoCount = sprintTasks.filter(
    (t) => t.status === "todo" || t.status === "blocked",
  ).length;
  const shippedCount = sprintTasks.filter(
    (t) => t.status === "done" && t.doneSubLabel === "shipped",
  ).length;

  const progressPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  // Per-member task count in this sprint
  const memberCounts = members.map((m) => ({
    ...m,
    count: sprintTasks.filter((t) => t.assigneeId === m.id).length,
  }));

  const dateRange = `${formatSprintDate(sprint.startDate)} → ${formatSprintDate(sprint.endDate)}`;

  return (
    <div
      className="mx-4 mt-3 mb-1 bg-card border border-border rounded-xl shadow-sm px-5 py-3.5 flex flex-col gap-2.5"
      data-ocid="sprint-progress-bar"
    >
      {/* ── Top row: sprint name + badge + date range + member pills ── */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Sprint name */}
        <span className="text-sm font-bold text-foreground leading-none">
          {sprint.name}
        </span>

        {/* Active badge with pulsing dot */}
        {sprint.status === "active" && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange-500/10 dark:bg-orange-400/15 border border-orange-300 dark:border-orange-500/40 text-orange-600 dark:text-orange-400 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500 dark:bg-orange-400" />
            </span>
            Active
          </span>
        )}
        {sprint.status === "completed" && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 dark:bg-green-400/15 border border-green-300 dark:border-green-500/40 text-green-600 dark:text-green-400 text-xs font-semibold">
            Completed
          </span>
        )}
        {sprint.status === "upcoming" && (
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground text-xs font-semibold">
            Upcoming
          </span>
        )}

        {/* Date range */}
        <span className="text-xs text-muted-foreground font-medium">
          {dateRange}
        </span>

        {/* Spacer */}
        <div className="flex-1 min-w-4" />

        {/* Member avatar pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {memberCounts.map((m, i) => (
            <div
              key={m.id}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/60 border border-border/60 text-xs font-medium text-foreground"
              title={`${m.name}: ${m.count} task${m.count !== 1 ? "s" : ""}`}
            >
              {/* Avatar circle */}
              <span
                className={cn(
                  "w-4.5 h-4.5 rounded-full flex items-center justify-center text-white text-[9px] font-bold leading-none flex-shrink-0",
                  AVATAR_COLORS[i % AVATAR_COLORS.length],
                )}
                style={{ width: "18px", height: "18px", fontSize: "9px" }}
              >
                {m.initials}
              </span>
              <span className="text-xs text-foreground/80">
                {m.id === currentUserId ? "You" : m.name.split(" ")[0]}
              </span>
              <span className="text-xs font-bold text-foreground ml-0.5">
                {m.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative h-2.5 bg-muted rounded-full overflow-hidden">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-xs font-bold text-primary min-w-[36px] text-right">
          {progressPct}%
        </span>
      </div>

      {/* ── Stats row ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <StatPill
          count={shippedCount}
          label="shipped"
          colorClass="bg-orange-500/10 dark:bg-orange-400/15 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-500/40"
          data-ocid="sprint-stat-shipped"
        />
        <StatPill
          count={inProgressCount}
          label="in progress"
          colorClass="bg-blue-500/10 dark:bg-blue-400/15 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-500/40"
          data-ocid="sprint-stat-inprogress"
        />
        <StatPill
          count={todoCount}
          label="todo"
          colorClass="bg-muted text-muted-foreground border-border"
          data-ocid="sprint-stat-todo"
        />
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">
          {doneCount}/{total} tasks complete
        </span>
      </div>
    </div>
  );
}

function StatPill({
  count,
  label,
  colorClass,
  ...rest
}: {
  count: number;
  label: string;
  colorClass: string;
  "data-ocid"?: string;
}) {
  return (
    <span
      {...rest}
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-semibold",
        colorClass,
      )}
    >
      <span className="font-bold">{count}</span>
      <span className="font-medium">{label}</span>
    </span>
  );
}
