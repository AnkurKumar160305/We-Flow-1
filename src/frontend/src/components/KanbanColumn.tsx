import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Task, TaskStatus, WorkspaceMember } from "../types";
import { TaskCard } from "./TaskCard";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  members: WorkspaceMember[];
  onTaskClick: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
}

const COLUMN_CONFIG: Record<
  TaskStatus,
  {
    title: string;
    countBg: string;
    headerBg: string;
    headerText: string;
    dot: string;
  }
> = {
  todo: {
    title: "To Do",
    countBg: "bg-muted text-muted-foreground",
    headerBg: "bg-muted/60",
    headerText: "text-foreground",
    dot: "bg-muted-foreground",
  },
  doing: {
    title: "Doing",
    countBg:
      "bg-blue-500/15 text-blue-500 dark:bg-blue-400/20 dark:text-blue-400",
    headerBg: "bg-blue-500/10 dark:bg-blue-400/10",
    headerText: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  done: {
    title: "Done",
    countBg:
      "bg-green-500/15 text-green-600 dark:bg-green-400/20 dark:text-green-400",
    headerBg: "bg-green-500/10 dark:bg-green-400/10",
    headerText: "text-green-700 dark:text-green-400",
    dot: "bg-green-500 dark:bg-green-400",
  },
  blocked: {
    title: "Blocked",
    countBg: "bg-red-500/15 text-red-600 dark:bg-red-400/20 dark:text-red-400",
    headerBg: "bg-red-500/10 dark:bg-red-400/10",
    headerText: "text-red-700 dark:text-red-400",
    dot: "bg-red-500 dark:bg-red-400",
  },
};

// Group done tasks by sub-label
function groupDoneTasks(tasks: Task[]) {
  const needsReview = tasks.filter(
    (t) => t.doneSubLabel === "needs_review" || !t.doneSubLabel,
  );
  const shipped = tasks.filter((t) => t.doneSubLabel === "shipped");
  return { needsReview, shipped };
}

export function KanbanColumn({
  status,
  tasks,
  members,
  onTaskClick,
  onAddTask,
}: KanbanColumnProps) {
  const config = COLUMN_CONFIG[status];

  return (
    <div
      className="flex flex-col w-[260px] flex-shrink-0 rounded-xl overflow-hidden border border-border bg-card shadow-card"
      data-ocid={`kanban-col-${status}`}
    >
      {/* Column header */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2.5",
          config.headerBg,
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn("w-2.5 h-2.5 rounded-full", config.dot)} />
          <span className={cn("text-sm font-semibold", config.headerText)}>
            {config.title}
          </span>
        </div>
        <Badge
          className={cn(
            "text-xs font-bold rounded-full px-2 py-0 h-5 border-0",
            config.countBg,
          )}
        >
          {tasks.length}
        </Badge>
      </div>

      {/* Tasks list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px] max-h-[calc(100vh-280px)]">
        {status === "done" ? (
          <DoneColumnContent
            tasks={tasks}
            members={members}
            onTaskClick={onTaskClick}
          />
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              members={members}
              onClick={onTaskClick}
            />
          ))
        )}

        {tasks.length === 0 && (
          <div
            className="flex items-center justify-center py-8 text-xs text-muted-foreground text-center"
            data-ocid={`col-empty-${status}`}
          >
            <span>No tasks here</span>
          </div>
        )}
      </div>

      {/* Add task button */}
      <div className="px-2 pb-2 pt-1 border-t border-border/60">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 justify-start gap-1.5 h-7"
          onClick={() => onAddTask(status)}
          data-ocid={`add-task-${status}`}
        >
          <Plus className="w-3.5 h-3.5" />
          Add task
        </Button>
      </div>
    </div>
  );
}

function DoneColumnContent({
  tasks,
  members,
  onTaskClick,
}: {
  tasks: Task[];
  members: WorkspaceMember[];
  onTaskClick: (task: Task) => void;
}) {
  const { needsReview, shipped } = groupDoneTasks(tasks);

  return (
    <>
      {needsReview.length > 0 && (
        <>
          <p className="text-[9px] font-bold tracking-widest uppercase text-muted-foreground px-1 pt-1">
            Needs Review
          </p>
          {needsReview.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              members={members}
              onClick={onTaskClick}
            />
          ))}
        </>
      )}
      {shipped.length > 0 && (
        <>
          <p className="text-[9px] font-bold tracking-widest uppercase text-green-600 dark:text-green-400 px-1 pt-1">
            Shipped
          </p>
          {shipped.map((task) => (
            <div key={task.id} className="relative">
              <TaskCard task={task} members={members} onClick={onTaskClick} />
              <Badge className="absolute top-2 right-2 text-[9px] bg-green-500/15 text-green-700 dark:bg-green-400/20 dark:text-green-400 border-green-300 dark:border-green-500/40 border font-semibold px-1.5 py-0 h-4">
                Shipped
              </Badge>
            </div>
          ))}
        </>
      )}
    </>
  );
}
