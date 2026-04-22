import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AlertTriangle, Calendar, Edit2, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { Task, TaskStatus, WorkspaceMember } from "../types";
import { DEPARTMENTS } from "../types";
import { Avatar } from "./Avatar";

interface TaskDetailModalProps {
  task: Task | null;
  members: WorkspaceMember[];
  open: boolean;
  onClose: () => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const PRIORITY_COLORS: Record<Task["priority"], string> = {
  critical:
    "bg-red-500/15 text-red-600 dark:text-red-400 border-red-300 dark:border-red-500/40",
  high: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-300 dark:border-orange-500/40",
  medium:
    "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/40",
  low: "bg-muted text-muted-foreground border-border",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: "To Do",
  doing: "In Progress",
  done: "Done",
  blocked: "Blocked",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: "bg-muted text-muted-foreground",
  doing: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  done: "bg-green-500/15 text-green-700 dark:text-green-400",
  blocked: "bg-red-500/15 text-red-700 dark:text-red-400",
};

export function TaskDetailModal({
  task,
  members,
  open,
  onClose,
  onMoveTask,
  onDeleteTask,
  onUpdateTask,
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  if (!task) return null;

  const assignee = members.find((m) => m.id === task.assigneeId);
  const dept = DEPARTMENTS.find((d) => d.id === task.departmentId);

  const handleStartEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onUpdateTask(task.id, {
      title: editTitle.trim() || task.title,
      description: editDescription.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDeleteTask(task.id);
    onClose();
  };

  const handleMove = (newStatus: string) => {
    onMoveTask(task.id, newStatus as TaskStatus);
    onClose();
  };

  const dueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-md p-0 overflow-hidden"
        data-ocid="task-detail-modal"
      >
        {/* Header */}
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-base font-semibold bg-muted rounded px-2 py-1 outline-none focus:ring-2 focus:ring-primary"
                />
              ) : (
                <DialogTitle className="text-base font-semibold text-foreground leading-snug pr-6">
                  {task.title}
                </DialogTitle>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Status + Priority row */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              className={cn(
                "text-xs font-semibold border",
                STATUS_COLORS[task.status],
              )}
            >
              {STATUS_LABELS[task.status]}
            </Badge>
            <Badge
              className={cn(
                "text-xs font-semibold capitalize border",
                PRIORITY_COLORS[task.priority],
              )}
            >
              {task.priority}
            </Badge>
            {task.doneSubLabel === "shipped" && (
              <Badge className="text-xs bg-green-500/15 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/40 font-semibold">
                Shipped
              </Badge>
            )}
          </div>

          {/* Description */}
          {isEditing ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add a description…"
              rows={3}
              className="w-full text-sm bg-muted rounded px-2 py-1.5 outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          ) : task.description ? (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {task.description}
            </p>
          ) : null}

          {/* Blocker note */}
          {task.isBlocked && task.blockerNote && (
            <div className="flex items-start gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-md p-3">
              <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 dark:text-red-400 leading-snug">
                {task.blockerNote}
              </p>
            </div>
          )}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3">
            {dept && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide mb-1">
                  Department
                </p>
                <span className="text-xs font-medium text-foreground">
                  {dept.name}
                </span>
              </div>
            )}
            {assignee && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide mb-1">
                  Assignee
                </p>
                <div className="flex items-center gap-1.5">
                  <Avatar
                    initials={assignee.initials}
                    name={assignee.name}
                    size="xs"
                  />
                  <span className="text-xs font-medium text-foreground truncate">
                    {assignee.name}
                  </span>
                </div>
              </div>
            )}
            {dueDate && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide mb-1">
                  Due Date
                </p>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">
                    {dueDate}
                  </span>
                </div>
              </div>
            )}
            {task.progress !== undefined && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide mb-1">
                  Progress
                </p>
                <span className="text-xs font-semibold text-primary">
                  {task.progress}%
                </span>
              </div>
            )}
          </div>

          {/* Move task */}
          <div>
            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide mb-1.5">
              Move to Column
            </p>
            <Select value={task.status} onValueChange={handleMove}>
              <SelectTrigger
                className="h-8 text-xs"
                data-ocid="task-status-select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="doing">Doing</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
            onClick={handleDelete}
            data-ocid="task-delete-btn"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
            Delete
          </Button>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={handleSaveEdit}
                  data-ocid="task-save-btn"
                >
                  Save
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={handleStartEdit}
                data-ocid="task-edit-btn"
              >
                <Edit2 className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
