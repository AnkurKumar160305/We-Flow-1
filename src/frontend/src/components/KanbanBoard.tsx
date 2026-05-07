import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Maximize2, Minimize2, Plus, TrendingUp } from "lucide-react";
import { useState } from "react";
import type { Sprint, Task, TaskStatus, WorkspaceMember } from "../types";
import { AddTaskModal } from "./AddTaskModal";
import { KanbanColumn } from "./KanbanColumn";
import { SprintProgressBar } from "./SprintProgressBar";
import { TaskDetailModal } from "./TaskDetailModal";

interface KanbanBoardProps {
  tasks: Task[];
  members: WorkspaceMember[];
  activeSprint: Sprint | undefined;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onAddTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  isFullScreen?: boolean;
  onToggleFullScreen?: () => void;
}

const COLUMNS: TaskStatus[] = ["todo", "doing", "done", "blocked"];

type BoardView = "startup" | "my";

export function KanbanBoard({
  tasks,
  members,
  activeSprint,
  onMoveTask,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  isFullScreen = false,
  onToggleFullScreen,
}: KanbanBoardProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [addTaskStatus, setAddTaskStatus] = useState<TaskStatus | null>(null);
  const [boardView, setBoardView] = useState<BoardView>("startup");

  const sprintTasks = activeSprint
    ? tasks.filter((t) => t.sprintId === activeSprint.id)
    : tasks;

  const dateRange = activeSprint
    ? `${formatDate(activeSprint.startDate)} – ${formatDate(activeSprint.endDate)}`
    : "";

  const momentum = 13;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Sprint header bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-card border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span>{activeSprint?.name ?? "Board"}</span>
          {dateRange && (
            <>
              <span className="text-muted-foreground/60 font-normal">·</span>
              <span className="text-muted-foreground font-normal text-xs">
                {dateRange}
              </span>
            </>
          )}
          {activeSprint?.goalSummary && (
            <>
              <span className="text-muted-foreground/60 font-normal">·</span>
              <span className="text-muted-foreground font-normal text-xs truncate max-w-[200px]">
                {activeSprint.goalSummary}
              </span>
            </>
          )}
        </div>

        <div className="flex-1" />

        {/* View tabs */}
        <div className="flex items-center bg-muted rounded-md p-0.5 gap-0.5">
          {(["startup", "my"] as BoardView[]).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setBoardView(view)}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-medium transition-colors",
                boardView === view
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
              data-ocid={`board-view-${view}`}
            >
              {view === "startup" ? "Startup View" : "My View"}
            </button>
          ))}
        </div>

        {/* Momentum indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-semibold text-primary">
            Momentum {momentum}%
          </span>
        </div>
        
        {/* Full screen toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onToggleFullScreen}
          title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
        >
          {isFullScreen ? (
            <Minimize2 className="w-4 h-4" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
        </Button>

        {/* New task button */}
        <Button
          size="sm"
          className="text-xs bg-primary text-primary-foreground hover:bg-primary/90 h-7 gap-1.5"
          onClick={() => setAddTaskStatus("todo")}
          data-ocid="new-task-btn"
        >
          <Plus className="w-3.5 h-3.5" />
          New task
        </Button>
      </div>

      {/* ── Sprint Progress Banner ── */}
      {activeSprint && (
        <div className="flex-shrink-0 overflow-y-visible">
          <SprintProgressBar
            sprint={activeSprint}
            tasks={tasks}
            members={members}
            currentUserId="user-1"
          />
        </div>
      )}

      {/* Columns area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex gap-3 p-4 h-full min-w-max">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={sprintTasks.filter((t) => t.status === status)}
              members={members}
              onTaskClick={setSelectedTask}
              onAddTask={(s) => setAddTaskStatus(s)}
            />
          ))}
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        members={members}
        open={selectedTask !== null}
        onClose={() => setSelectedTask(null)}
        onMoveTask={onMoveTask}
        onDeleteTask={onDeleteTask}
        onUpdateTask={onUpdateTask}
      />

      {/* Add Task Modal */}
      <AddTaskModal
        open={addTaskStatus !== null}
        defaultStatus={addTaskStatus ?? "todo"}
        sprintId={activeSprint?.id}
        members={members}
        onClose={() => setAddTaskStatus(null)}
        onAdd={onAddTask}
      />
    </div>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
