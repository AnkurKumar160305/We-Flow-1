import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import type { Task, TaskPriority, TaskStatus, WorkspaceMember } from "../types";
import { DEPARTMENTS } from "../types";

interface AddTaskModalProps {
  open: boolean;
  defaultStatus: TaskStatus;
  sprintId?: string;
  members: WorkspaceMember[];
  onClose: () => void;
  onAdd: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
}

export function AddTaskModal({
  open,
  defaultStatus,
  sprintId,
  members,
  onClose,
  onAdd,
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("engineering");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>("");

  const reset = () => {
    setTitle("");
    setDescription("");
    setDepartmentId("engineering");
    setPriority("medium");
    setDueDate("");
    setAssigneeId("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      status: defaultStatus,
      priority,
      departmentId,
      assigneeId: assigneeId || undefined,
      dueDate: dueDate || undefined,
      sprintId: sprintId || undefined,
      tags: [],
    });

    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-sm" data-ocid="add-task-modal">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Add New Task
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="task-title" className="text-xs font-semibold">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title…"
              className="h-8 text-sm"
              autoFocus
              data-ocid="add-task-title"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-description" className="text-xs font-semibold">
              Description
            </Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description…"
              rows={3}
              className="text-sm resize-none"
              data-ocid="add-task-description"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Department</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger
                  className="h-8 text-xs"
                  data-ocid="add-task-dept"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="text-xs">
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as TaskPriority)}
              >
                <SelectTrigger
                  className="h-8 text-xs"
                  data-ocid="add-task-priority"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low" className="text-xs">
                    Low
                  </SelectItem>
                  <SelectItem value="medium" className="text-xs">
                    Medium
                  </SelectItem>
                  <SelectItem value="high" className="text-xs">
                    High
                  </SelectItem>
                  <SelectItem value="critical" className="text-xs">
                    Critical
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-due" className="text-xs font-semibold">
                Due Date
              </Label>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-8 text-xs"
                data-ocid="add-task-due"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Assignee</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger
                  className="h-8 text-xs"
                  data-ocid="add-task-assignee"
                >
                  <SelectValue placeholder="Unassigned" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={handleClose}
              data-ocid="add-task-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!title.trim()}
              data-ocid="add-task-submit"
            >
              Add Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
