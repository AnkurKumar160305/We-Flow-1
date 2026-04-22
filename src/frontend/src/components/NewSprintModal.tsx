import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  Check,
  ChevronRight,
  Plus,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MOCK_MEMBERS, MOCK_TASKS } from "../data/mockData";
import type {
  MemberTaskAssignment,
  Sprint,
  Task,
  WorkspaceMember,
} from "../types";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Step1Data {
  goal: string;
  description: string;
  deadline: string;
}

export type { MemberTaskAssignment };

interface SprintCreationModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (
    sprint: Omit<Sprint, "id" | "taskIds" | "velocity">,
    members: WorkspaceMember[],
    assignments: MemberTaskAssignment[],
  ) => void;
  nextSprintNumber: number;
  milestoneDeadline?: Date;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getDefaultDeadline(
  sprintStartDate?: string,
  sprintDurationDays?: number,
  milestoneDeadline?: Date,
): string {
  if (sprintStartDate && sprintDurationDays) {
    const d = new Date(sprintStartDate);
    d.setDate(d.getDate() + sprintDurationDays - 1);
    return d.toISOString().slice(0, 10);
  }
  const base = milestoneDeadline ?? new Date();
  const d = new Date(base);
  if (!milestoneDeadline) d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export function getMaxDeadlineFromStart(startDate: string): string {
  const d = new Date(startDate);
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

function getMaxDeadline(): string {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

export function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export const DEPT_LABELS: Record<string, string> = {
  engineering: "Engineering",
  design: "Design",
  product: "Product",
  marketing: "Marketing",
  data: "Data",
  ops: "Operations",
};

export const DEPT_BADGE_CLASSES: Record<string, string> = {
  engineering:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  design:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  product:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  marketing: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  data: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  ops: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

// ─── Step Progress Indicator ─────────────────────────────────────────────────

export function StepIndicator({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  const steps = [
    { num: 1, label: "Details" },
    { num: 2, label: "Team" },
    { num: 3, label: "Tasks" },
  ];

  return (
    <div className="flex items-center justify-center gap-0 mb-6">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300
                ${
                  currentStep > s.num
                    ? "bg-green-500 border-green-500 text-white"
                    : currentStep === s.num
                      ? "bg-primary border-primary text-primary-foreground shadow-md scale-110"
                      : "bg-muted border-border text-muted-foreground"
                }
              `}
            >
              {currentStep > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span
              className={`text-[10px] font-medium tracking-wide uppercase ${
                currentStep === s.num
                  ? "text-primary"
                  : currentStep > s.num
                    ? "text-green-500"
                    : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-16 h-0.5 mx-1 mb-5 transition-all duration-300 ${
                currentStep > s.num ? "bg-green-500" : "bg-border"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 1: Sprint Details ───────────────────────────────────────────────────

export function SprintStep1({
  data,
  onChange,
  error,
  helperText,
  startDate,
}: {
  data: Step1Data;
  onChange: (d: Step1Data) => void;
  error: string;
  helperText?: string;
  startDate?: string;
}) {
  const minDate = startDate ?? getTodayStr();
  const maxDate = startDate
    ? getMaxDeadlineFromStart(startDate)
    : getMaxDeadline();

  return (
    <div className="space-y-5 animate-in fade-in-0 slide-in-from-right-4 duration-300">
      {/* Sprint Goal */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">
          Sprint Goal <span className="text-destructive">*</span>
        </Label>
        <Input
          value={data.goal}
          maxLength={100}
          placeholder="Enter sprint goal (max 100 characters)"
          onChange={(e) => onChange({ ...data, goal: e.target.value })}
          className={`text-sm ${error ? "border-destructive ring-destructive/30" : ""}`}
          autoFocus
          data-ocid="sprint.goal_input"
        />
        <div className="flex items-center justify-between">
          {error ? (
            <p
              className="text-xs text-destructive"
              data-ocid="sprint.goal_error"
            >
              {error}
            </p>
          ) : (
            <span />
          )}
          <span
            className={`text-xs ml-auto ${data.goal.length >= 90 ? "text-destructive" : "text-muted-foreground"}`}
          >
            {data.goal.length}/100
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Description</Label>
        <Textarea
          value={data.description}
          placeholder="Describe your goal (optional)"
          rows={4}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          className="text-sm resize-none"
          data-ocid="sprint.description_textarea"
        />
      </div>

      {/* Deadline */}
      <div className="space-y-1.5">
        <Label className="text-sm font-semibold">Deadline</Label>
        <Input
          type="date"
          value={data.deadline}
          min={minDate}
          max={maxDate}
          onChange={(e) => onChange({ ...data, deadline: e.target.value })}
          className="text-sm"
          data-ocid="sprint.deadline_input"
        />
        <p className="text-xs text-muted-foreground">
          {helperText ?? "You can adjust up to 30 days."}
        </p>
      </div>
    </div>
  );
}

// ─── Step 2: Add Team Members ─────────────────────────────────────────────────

export function SprintStep2({
  selectedIds,
  onToggle,
  error,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
  error: string;
}) {
  const [search, setSearch] = useState("");

  const filtered = MOCK_MEMBERS.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.departmentId ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (DEPT_LABELS[m.departmentId ?? ""] ?? "")
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const selectedMembers = MOCK_MEMBERS.filter((m) =>
    selectedIds.includes(m.id),
  );

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-300">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or department"
          className="pl-9 text-sm"
          data-ocid="sprint.member_search_input"
        />
      </div>

      {/* Selected Members */}
      {selectedMembers.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Selected ({selectedMembers.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedMembers.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary rounded-full pl-1.5 pr-2 py-0.5 text-xs font-medium"
                data-ocid={`sprint.selected_member.${m.id}`}
              >
                <Avatar className="w-5 h-5">
                  <AvatarFallback className="text-[9px] bg-primary text-primary-foreground">
                    {m.initials}
                  </AvatarFallback>
                </Avatar>
                <span>{m.name.split(" ")[0]}</span>
                <button
                  type="button"
                  onClick={() => onToggle(m.id)}
                  className="hover:text-destructive transition-colors"
                  data-ocid={`sprint.remove_member.${m.id}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-xs text-destructive" data-ocid="sprint.team_error">
          {error}
        </p>
      )}

      {/* Member list */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          All Members
        </p>
        <ScrollArea className="h-52">
          <div className="space-y-1 pr-2">
            {filtered.map((m, idx) => {
              const isSelected = selectedIds.includes(m.id);
              const deptLabel =
                DEPT_LABELS[m.departmentId ?? ""] ?? m.departmentId;
              const badgeCls =
                DEPT_BADGE_CLASSES[m.departmentId ?? ""] ??
                "bg-muted text-muted-foreground";
              return (
                <div
                  key={m.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 ${
                    isSelected
                      ? "bg-muted/50 border-border opacity-70"
                      : "bg-card border-border hover:bg-muted/30 cursor-pointer"
                  }`}
                  onClick={() => onToggle(m.id)}
                  onKeyDown={(e) => e.key === "Enter" && onToggle(m.id)}
                  data-ocid={`sprint.member_row.${idx + 1}`}
                >
                  <button
                    type="button"
                    className={`flex-none w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                      isSelected
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-primary/40 hover:border-primary hover:bg-primary/10 text-primary"
                    }`}
                  >
                    {isSelected ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <Avatar className="w-8 h-8 flex-none">
                    <AvatarFallback className="text-xs bg-secondary text-secondary-foreground font-semibold">
                      {m.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.name}</p>
                  </div>
                  <span
                    className={`flex-none text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeCls}`}
                  >
                    {deptLabel}
                  </span>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No members found
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

// ─── Step 3: Assign Tasks ─────────────────────────────────────────────────────

interface MemberTaskCardProps {
  member: WorkspaceMember;
  assignment: MemberTaskAssignment;
  onAssign: (memberId: string, taskId: string) => void;
  onUnassign: (memberId: string, taskId: string) => void;
  onAddNewTask: (memberId: string, taskName: string) => void;
}

function MemberTaskCard({
  member,
  assignment,
  onAssign,
  onUnassign,
  onAddNewTask,
}: MemberTaskCardProps) {
  const [bucketOpen, setBucketOpen] = useState(false);
  const [newTaskInputOpen, setNewTaskInputOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const newTaskRef = useRef<HTMLInputElement>(null);

  const memberTasks: Task[] = MOCK_TASKS;
  const deptLabel = DEPT_LABELS[member.departmentId ?? ""] ?? member.role;

  useEffect(() => {
    if (newTaskInputOpen) newTaskRef.current?.focus();
  }, [newTaskInputOpen]);

  const handleAddNew = () => {
    if (!newTaskName.trim()) return;
    onAddNewTask(member.id, newTaskName.trim());
    setNewTaskName("");
    setNewTaskInputOpen(false);
  };

  return (
    <div
      className="border border-border rounded-xl bg-card shadow-sm overflow-hidden"
      data-ocid={`sprint.member_card.${member.id}`}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/20">
        <Avatar className="w-9 h-9 flex-none">
          <AvatarFallback className="text-sm font-bold bg-primary/10 text-primary">
            {member.initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{member.name}</p>
          <p className="text-xs text-muted-foreground">{deptLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Browse existing tasks"
            onClick={() => setBucketOpen((v) => !v)}
            className={`p-1.5 rounded-lg border transition-all duration-200 text-sm ${
              bucketOpen
                ? "bg-primary/10 border-primary/40 text-primary"
                : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"
            }`}
            data-ocid={`sprint.bucket_toggle.${member.id}`}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setNewTaskInputOpen((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 border border-primary/30 hover:bg-primary/5 rounded-lg px-2.5 py-1.5 transition-all"
            data-ocid={`sprint.add_task_button.${member.id}`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Task
          </button>
        </div>
      </div>

      {/* Inline new task input */}
      {newTaskInputOpen && (
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-muted/10 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <Input
            ref={newTaskRef}
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="New task name..."
            className="text-sm h-8 flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddNew();
              if (e.key === "Escape") setNewTaskInputOpen(false);
            }}
            data-ocid={`sprint.new_task_input.${member.id}`}
          />
          <Button
            type="button"
            size="sm"
            className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleAddNew}
            disabled={!newTaskName.trim()}
            data-ocid={`sprint.new_task_add.${member.id}`}
          >
            Add
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setNewTaskInputOpen(false)}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Bucket dropdown */}
      {bucketOpen && (
        <div className="px-4 py-3 border-b border-border bg-background/50 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wider">
            Existing Tasks
          </p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {memberTasks.map((task) => {
              const alreadyAdded = assignment.taskIds.includes(task.id);
              return (
                <button
                  key={task.id}
                  type="button"
                  disabled={alreadyAdded}
                  className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all text-left ${
                    alreadyAdded
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-muted/50 cursor-pointer"
                  }`}
                  onClick={() => !alreadyAdded && onAssign(member.id, task.id)}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-none transition-all ${
                      alreadyAdded
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-primary/40 text-primary hover:border-primary"
                    }`}
                  >
                    {alreadyAdded ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                  </div>
                  <span className="text-sm truncate">{task.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected tasks */}
      {(assignment.taskIds.length > 0 || assignment.newTasks.length > 0) && (
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wider">
            Selected Tasks (
            {assignment.taskIds.length + assignment.newTasks.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {assignment.taskIds.map((tid) => {
              const task = MOCK_TASKS.find((t) => t.id === tid);
              if (!task) return null;
              return (
                <div
                  key={tid}
                  className="flex items-center gap-1.5 bg-primary/8 border border-primary/20 rounded-full px-3 py-1 text-xs font-medium text-foreground"
                >
                  <span className="max-w-[140px] truncate">{task.title}</span>
                  <button
                    type="button"
                    onClick={() => onUnassign(member.id, tid)}
                    className="hover:text-destructive transition-colors ml-0.5"
                    data-ocid={`sprint.remove_task.${member.id}.${tid}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
            {assignment.newTasks.map((taskName) => (
              <div
                key={`new-${taskName}`}
                className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1 text-xs font-medium text-green-700 dark:text-green-400"
              >
                <span className="max-w-[140px] truncate">{taskName}</span>
                <button
                  type="button"
                  onClick={() =>
                    onUnassign(member.id, `__newname__${taskName}`)
                  }
                  className="hover:text-destructive transition-colors ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {assignment.taskIds.length === 0 &&
        assignment.newTasks.length === 0 &&
        !bucketOpen &&
        !newTaskInputOpen && (
          <div className="px-4 py-3 text-xs text-muted-foreground italic">
            No tasks assigned yet — use the bucket or add a new task.
          </div>
        )}
    </div>
  );
}

export function SprintStep3({
  selectedMembers,
  assignments,
  onAssign,
  onUnassign,
  onAddNewTask,
}: {
  selectedMembers: WorkspaceMember[];
  assignments: MemberTaskAssignment[];
  onAssign: (memberId: string, taskId: string) => void;
  onUnassign: (memberId: string, taskId: string) => void;
  onAddNewTask: (memberId: string, taskName: string) => void;
}) {
  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-right-4 duration-300">
      <p className="text-sm text-muted-foreground">
        Assign tasks to each team member. You can add new tasks or pick from
        existing ones.
      </p>
      <ScrollArea className="h-[340px]">
        <div className="space-y-4 pr-1">
          {selectedMembers.map((m) => {
            const asgn = assignments.find((a) => a.memberId === m.id) ?? {
              memberId: m.id,
              taskIds: [],
              newTasks: [],
            };
            return (
              <MemberTaskCard
                key={m.id}
                member={m}
                assignment={asgn}
                onAssign={onAssign}
                onUnassign={onUnassign}
                onAddNewTask={onAddNewTask}
              />
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}

// ─── Shared Sprint Form State Hook ────────────────────────────────────────────

export function useSprintFormState(defaultDeadline: string) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [step1, setStep1] = useState<Step1Data>({
    goal: "",
    description: "",
    deadline: defaultDeadline,
  });
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<MemberTaskAssignment[]>([]);
  const [goalError, setGoalError] = useState("");
  const [teamError, setTeamError] = useState("");

  const reset = useCallback((newDeadline: string) => {
    setStep(1);
    setStep1({ goal: "", description: "", deadline: newDeadline });
    setSelectedMemberIds([]);
    setAssignments([]);
    setGoalError("");
    setTeamError("");
  }, []);

  const toggleMember = (id: string) => {
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setAssignments((prev) => {
      if (prev.find((a) => a.memberId === id)) {
        return prev.filter((a) => a.memberId !== id);
      }
      return [...prev, { memberId: id, taskIds: [], newTasks: [] }];
    });
  };

  const assignTask = (memberId: string, taskId: string) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.memberId === memberId && !a.taskIds.includes(taskId)
          ? { ...a, taskIds: [...a.taskIds, taskId] }
          : a,
      ),
    );
  };

  const unassignTask = (memberId: string, taskId: string) => {
    if (taskId.startsWith("__newname__")) {
      const taskName = taskId.replace("__newname__", "");
      setAssignments((prev) =>
        prev.map((a) =>
          a.memberId === memberId
            ? { ...a, newTasks: a.newTasks.filter((t) => t !== taskName) }
            : a,
        ),
      );
    } else {
      setAssignments((prev) =>
        prev.map((a) =>
          a.memberId === memberId
            ? { ...a, taskIds: a.taskIds.filter((t) => t !== taskId) }
            : a,
        ),
      );
    }
  };

  const addNewTask = (memberId: string, taskName: string) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.memberId === memberId
          ? { ...a, newTasks: [...a.newTasks, taskName] }
          : a,
      ),
    );
  };

  const goNext = (): boolean => {
    if (step === 1) {
      if (!step1.goal.trim()) {
        setGoalError("Sprint goal is required.");
        return false;
      }
      setGoalError("");
      setStep(2);
    } else if (step === 2) {
      if (selectedMemberIds.length === 0) {
        setTeamError("Please add at least one team member.");
        return false;
      }
      setTeamError("");
      setStep(3);
    }
    return true;
  };

  const goBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
  };

  const selectedMembers = MOCK_MEMBERS.filter((m) =>
    selectedMemberIds.includes(m.id),
  );

  return {
    step,
    step1,
    setStep1,
    selectedMemberIds,
    selectedMembers,
    assignments,
    goalError,
    teamError,
    reset,
    toggleMember,
    assignTask,
    unassignTask,
    addNewTask,
    goNext,
    goBack,
  };
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function NewSprintModal({
  open,
  onClose,
  onAdd,
  nextSprintNumber,
  milestoneDeadline,
}: SprintCreationModalProps) {
  const defaultDeadline = getDefaultDeadline(
    undefined,
    undefined,
    milestoneDeadline,
  );
  const form = useSprintFormState(defaultDeadline);

  const resetForm = form.reset;
  // Reset all state on open
  useEffect(() => {
    if (open) {
      resetForm(getDefaultDeadline(undefined, undefined, milestoneDeadline));
    }
  }, [open, milestoneDeadline, resetForm]);

  const handleCreate = () => {
    onAdd(
      {
        name: `Sprint ${nextSprintNumber}`,
        startDate: getTodayStr(),
        endDate: form.step1.deadline,
        goalSummary: form.step1.goal.trim(),
        status: "upcoming",
      },
      form.selectedMembers,
      form.assignments,
    );
    onClose();
  };

  const stepTitles: Record<number, string> = {
    1: "Create New Sprint",
    2: "Add Team Members",
    3: "Assign Tasks",
  };

  if (!open) return null;

  return (
    <dialog
      open
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent border-none outline-none w-full h-full max-w-full max-h-full m-0 pointer-events-auto"
      data-ocid="sprint.creation_dialog"
    >
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close dialog"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-[760px] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden pointer-events-auto">
        {/* Modal Header */}
        <div className="px-8 pt-7 pb-4 border-b border-border bg-card">
          <h2 className="text-lg font-bold font-display text-foreground">
            {stepTitles[form.step]}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {form.step === 1 && "Set the sprint goal and timeline."}
            {form.step === 2 && "Select who will work on this sprint."}
            {form.step === 3 && "Assign tasks to your team members."}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="px-8 pt-5">
          <StepIndicator currentStep={form.step} />
        </div>

        {/* Step Content */}
        <div className="px-8 pb-2">
          {form.step === 1 && (
            <SprintStep1
              data={form.step1}
              onChange={form.setStep1}
              error={form.goalError}
              helperText={
                milestoneDeadline
                  ? "Based on milestone. You can adjust up to 30 days."
                  : "Defaulted to +7 days. You can adjust up to 30 days."
              }
            />
          )}
          {form.step === 2 && (
            <SprintStep2
              selectedIds={form.selectedMemberIds}
              onToggle={form.toggleMember}
              error={form.teamError}
            />
          )}
          {form.step === 3 && (
            <SprintStep3
              selectedMembers={form.selectedMembers}
              assignments={form.assignments}
              onAssign={form.assignTask}
              onUnassign={form.unassignTask}
              onAddNewTask={form.addNewTask}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-border bg-muted/20 mt-4">
          {form.step === 1 ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-ocid="sprint.cancel_button"
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={form.goBack}
              data-ocid="sprint.back_button"
            >
              ← Back
            </Button>
          )}

          {form.step < 3 ? (
            <Button
              type="button"
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 font-semibold px-5"
              onClick={form.goNext}
              data-ocid="sprint.next_button"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 gap-2 shadow-md"
              onClick={handleCreate}
              data-ocid="sprint.create_button"
            >
              Create Sprint 🚀
            </Button>
          )}
        </div>
      </div>
    </dialog>
  );
}
