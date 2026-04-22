import { cn } from "@/lib/utils";
import { AlertTriangle, Calendar, ChevronRight } from "lucide-react";
import type { Task, WorkspaceMember } from "../types";
import { Avatar } from "./Avatar";
import { DeptTag } from "./DeptTag";

interface TaskCardProps {
  task: Task;
  members?: WorkspaceMember[];
  onClick?: (task: Task) => void;
  className?: string;
}

function PriorityDot({ priority }: { priority: Task["priority"] }) {
  const map = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-400",
    low: "bg-muted-foreground/40",
  };
  return (
    <span
      className={cn("w-2 h-2 rounded-full flex-shrink-0", map[priority])}
      title={`Priority: ${priority}`}
    />
  );
}

function formatDueDate(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const today = new Date();
  const diff = Math.ceil(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Due today";
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 1) return "Due tomorrow";
  return `Apr ${date.getDate()}`;
}

function isDueSoon(iso?: string): boolean {
  if (!iso) return false;
  const diff = Math.ceil(
    (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  return diff <= 2 && diff >= 0;
}

function isOverdue(iso?: string): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

export function TaskCard({
  task,
  members = [],
  onClick,
  className,
}: TaskCardProps) {
  const assignee = members.find((m) => m.id === task.assigneeId);
  const dueSoon = isDueSoon(task.dueDate);
  const overdue = isOverdue(task.dueDate);

  if (task.isBlocked) {
    return (
      <button
        type="button"
        className={cn(
          "w-full text-left rounded-lg border border-red-300 dark:border-red-500/40 bg-red-50 dark:bg-red-500/10 p-3 cursor-pointer transition-smooth hover:shadow-card",
          className,
        )}
        onClick={() => onClick?.(task)}
        data-ocid={`task-card-${task.id}`}
      >
        <div className="flex items-start gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
            {task.title}
          </p>
        </div>
        {task.blockerNote && (
          <p className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-500/15 rounded px-2 py-1 mb-2 leading-snug">
            🚧 {task.blockerNote}
          </p>
        )}
        <div className="flex items-center justify-between">
          <DeptTag departmentId={task.departmentId} />
          {assignee && (
            <Avatar
              initials={assignee.initials}
              name={assignee.name}
              size="xs"
            />
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "w-full text-left rounded-lg border border-border bg-card p-3 cursor-pointer group transition-smooth hover:shadow-elevated hover:border-primary/20",
        className,
      )}
      onClick={() => onClick?.(task)}
      data-ocid={`task-card-${task.id}`}
    >
      {/* Title row */}
      <div className="flex items-start gap-2 mb-2">
        <PriorityDot priority={task.priority} />
        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2 flex-1 min-w-0">
          {task.title}
        </p>
        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/60 flex-shrink-0 transition-colors" />
      </div>

      {/* Progress bar (only for doing) */}
      {task.status === "doing" && task.progress !== undefined && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground font-medium">
              Progress
            </span>
            <span className="text-[10px] font-semibold text-primary">
              {task.progress}%
            </span>
          </div>
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <DeptTag departmentId={task.departmentId} />
          {task.dueDate && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-[10px] font-medium",
                overdue
                  ? "text-red-600 dark:text-red-400"
                  : dueSoon
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-muted-foreground",
              )}
            >
              <Calendar className="w-2.5 h-2.5" />
              {formatDueDate(task.dueDate)}
            </span>
          )}
        </div>
        {assignee && (
          <Avatar initials={assignee.initials} name={assignee.name} size="xs" />
        )}
      </div>
    </button>
  );
}
