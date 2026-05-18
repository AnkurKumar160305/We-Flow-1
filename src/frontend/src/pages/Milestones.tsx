import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Archive,
  Calendar,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Copy,
  Flag,
  Link2,
  Loader2,
  MoreVertical,
  Plus,
  Rocket,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Layout } from "../components/Layout";
import { Avatar } from "../components/Avatar";
import { useAuthStore } from "../hooks/useAuthStore";

import {
  SprintStep1,
  SprintStep2,
  SprintStep3,
  StepIndicator,
  getDefaultDeadline,
  getMaxDeadlineFromStart,
  useSprintFormState,
} from "../components/NewSprintModal";
import { NewSprintModal } from "../components/NewSprintModal";
import { MOCK_MEMBERS } from "../data/mockData";
import {
  useAddSprintToMilestone,
  useCreateMilestone,
  useDeleteMilestone,
  useIsWorkspaceCreator,
  useMilestones,
  useUpdateMilestoneSprintAssignees,
  useWorkspace,
  useTeamMembers,
} from "../hooks/useBackend";

import type {
  CreateMilestoneArgs,
  Milestone,
  MilestoneSprintInfo,
  Sprint,
  SprintFormData,
  WorkspaceMember,
} from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysBetween(a: string, b: string) {
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24),
  );
}

// ─── Sprint Card ─────────────────────────────────────────────────────────────

function SprintCard({
  sprint,
  milestoneId,
  workspaceId,
  index,
}: {
  sprint: MilestoneSprintInfo;
  milestoneId: string;
  workspaceId: string;
  index: number;
}) {
  const [assignees, setAssignees] = useState(sprint.assignees);
  const [copied, setCopied] = useState(false);
  const updateAssignees = useUpdateMilestoneSprintAssignees();
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inviteLink =
    sprint.inviteLink ?? `https://weflow.app/invite/${sprint.id}`;

  function handleAssigneesChange(val: string) {
    setAssignees(val);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateAssignees.mutate({
        milestoneId,
        sprintId: sprint.id,
        assignees: val,
        workspaceId,
      });
    }, 600);
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const statusColors: Record<string, string> = {
    active: "bg-primary/10 text-primary border-primary/30",
    upcoming: "bg-muted text-muted-foreground border-border",
    completed:
      "bg-green-500/10 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/40",
  };

  return (
    <div
      className="bg-card rounded-xl border border-border p-5 space-y-4"
      data-ocid={`sprint-card.item.${index + 1}`}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate font-display">
              {sprint.name}
            </p>
            {sprint.goalSummary && (
              <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                {sprint.goalSummary}
              </p>
            )}
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              {fmt(sprint.startDate)} – {fmt(sprint.endDate)}
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] flex-shrink-0 capitalize",
            statusColors[sprint.status],
          )}
        >
          {sprint.status}
        </Badge>
      </div>

      {/* Assignees */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          Assignees
        </Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {sprint.assignees.split(',').filter(Boolean).map((a, idx) => {
            const [name, role] = a.split('/').map(s => s.trim());
            return (
              <div key={idx} className="flex items-center gap-2 bg-muted/50 border border-border rounded-full pl-1 pr-2.5 py-1 text-[10px] font-medium animate-in fade-in zoom-in-95 duration-300">
                <Avatar initials={name.substring(0,2).toUpperCase()} size="xs" />
                <div className="flex flex-col leading-tight">
                  <span>{name}</span>
                  <span className="text-[8px] text-muted-foreground">{role}</span>
                </div>
              </div>
            );
          })}
        </div>
        <Input
          value={assignees}
          onChange={(e) => handleAssigneesChange(e.target.value)}
          placeholder="Add member (Name / Role)"
          className="text-xs h-8 bg-background border-dashed"
          data-ocid={`sprint-assignees.item.${index + 1}`}
        />
      </div>


      {/* Invite link */}
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5" />
          Invite Link
        </Label>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 bg-muted/60 border border-border rounded-md px-3 py-1.5 flex items-center gap-2">
            <Link2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate font-mono">
              {inviteLink}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className={cn(
              "h-8 px-3 text-xs gap-1.5 flex-shrink-0 transition-colors",
              copied
                ? "bg-green-500/10 border-green-400 text-green-600 dark:text-green-400"
                : "hover:bg-primary/5 hover:border-primary/40 hover:text-primary",
            )}
            onClick={handleCopy}
            data-ocid={`sprint-invite-copy.item.${index + 1}`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Milestone Detail View ────────────────────────────────────────────────────

function MilestoneDetail({
  milestone,
  workspaceId,
  onNewSprint,
}: {
  milestone: Milestone;
  workspaceId: string;
  onNewSprint: () => void;
}) {
  const duration = daysBetween(milestone.startDate, milestone.endDate);

  return (
    <div className="space-y-6">
      {/* Big milestone header */}
      <div className="bg-gradient-to-br from-primary/15 via-primary/8 to-transparent border border-primary/25 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 shadow-md">
            <Flag className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold font-display text-foreground break-words">
              {milestone.name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-primary" />
                <span>
                  {fmt(milestone.startDate)} → {fmt(milestone.endDate)}
                </span>
              </span>
              <Badge className="bg-primary/10 text-primary border-primary/30 text-xs font-semibold">
                {duration} days · {milestone.sprints.length} sprints
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Sprint cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
            Sprints
          </h3>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs h-7 border-primary/40 text-primary hover:bg-primary/5 hover:border-primary/60"
            onClick={onNewSprint}
            data-ocid="milestone.add_sprint_button"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Sprint
          </Button>
        </div>
        <div className="space-y-3">
          {milestone.sprints.map((sprint, i) => (
            <SprintCard
              key={sprint.id}
              sprint={sprint}
              milestoneId={milestone.id}
              workspaceId={workspaceId}
              index={i}
            />
          ))}
          {milestone.sprints.length === 0 && (
            <div
              className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-border rounded-xl text-center"
              data-ocid="milestone.sprints.empty_state"
            >
              <ClipboardList className="w-8 h-8 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No sprints yet
              </p>
              <p className="text-xs text-muted-foreground/70 mt-1 mb-4">
                Add a sprint to start tracking work
              </p>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 gap-1.5 text-xs"
                onClick={onNewSprint}
                data-ocid="milestone.sprints.empty_add_button"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Sprint
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Create Milestone Modal ───────────────────────────────────────────────────
//
// Flow:
//   Phase "details"   → Set Name, Start, End
//   Phase "overview"  → View added sprints, select duration (+ 2 Sprints / + 4 Sprints / + Custom)
//   Phase "sprint-form" → Configure an individual sprint
//   After finishing milestone → createMilestone with all collected sprints

interface CreateModalProps {
  workspaceId: string;
  onClose: () => void;
  onCreated: (m: Milestone) => void;
  milestoneNumber: number;
  initialData?: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
  };
}

type ModalPhase = "details" | "overview" | "sprint-form";
type SprintDurationOption = 2 | 4 | "custom";

function CreateMilestoneModal({
  workspaceId,
  onClose,
  onCreated,
  milestoneNumber,
  initialData,
}: CreateModalProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [startDate, setStartDate] = useState(initialData?.startDate || new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(initialData?.endDate || "");

  const [configuredSprints, setConfiguredSprints] = useState<SprintFormData[]>([]);
  const [currentOption, setCurrentOption] = useState<SprintDurationOption | null>(null);
  const [targetSprintsCount, setTargetSprintsCount] = useState<number>(0);
  const [createdSprintsInBatch, setCreatedSprintsInBatch] = useState<number>(0);

  const { data: allMembers = [] } = useTeamMembers();
  const acceptedMembers = allMembers.filter(m => m.status === "accepted");

  const [phase, setPhase] = useState<ModalPhase>(initialData ? "overview" : "details");

  const createMilestone = useCreateMilestone();
  const today = new Date().toISOString().split("T")[0];

  const computeNextSprintStart = () => {
    if (configuredSprints.length > 0) {
      const lastDeadline = configuredSprints[configuredSprints.length - 1].deadline;
      const d = new Date(lastDeadline);
      d.setDate(d.getDate() + 1);
      return d.toISOString().slice(0, 10);
    }
    return startDate || today;
  };
  
  const currentSprintStart = computeNextSprintStart();
  const currentSprintDeadline =
    currentOption === 2 || currentOption === 4
      ? getDefaultDeadline(currentSprintStart, currentOption)
      : getDefaultDeadline(
          currentSprintStart,
          7,
          endDate ? new Date(endDate) : undefined,
        );
        
  const currentSprintMaxDeadline = getMaxDeadlineFromStart(currentSprintStart);

  const sprintForm = useSprintFormState(currentSprintDeadline, acceptedMembers);
  const resetSprintForm = sprintForm.reset;


  useEffect(() => {
    if (phase === "sprint-form") {
      resetSprintForm(currentSprintDeadline);
    }
  }, [phase, currentSprintDeadline, resetSprintForm]);

  function handleMilestoneNext() {
    if (!name.trim() || !startDate) return;
    setPhase("overview");
  }

  function handleAddSprint(option: SprintDurationOption) {
    setCurrentOption(option);
    if (option === 2 || option === 4) {
      setTargetSprintsCount(option);
    } else {
      setTargetSprintsCount(1);
    }
    setCreatedSprintsInBatch(0);
    setPhase("sprint-form");
  }

  function handleSprintNext() {
    sprintForm.goNext();
  }

  function handleSprintFinish() {
    const currentData: SprintFormData = {
      goal: sprintForm.step1.goal.trim(),
      description: sprintForm.step1.description,
      deadline: sprintForm.step1.deadline,
      memberIds: sprintForm.selectedMemberIds,
      assignments: sprintForm.assignments,
    };
    setConfiguredSprints((prev) => [...prev, currentData]);
    
    const nextCreatedCount = createdSprintsInBatch + 1;
    setCreatedSprintsInBatch(nextCreatedCount);
    
    if (nextCreatedCount >= targetSprintsCount) {
      setPhase("overview");
      setCurrentOption(null);
    }
    // Else, we stay in sprint-form phase to create the next sprint in the batch.
  }

  function handleSprintPhaseBack() {
    if (sprintForm.step === 1) {
      setPhase("overview");
      setCurrentOption(null);
    } else {
      sprintForm.goBack();
    }
  }

  async function handleCreateMilestone() {
    const milestoneId = `ms-${Date.now()}`;
    let trackStart = startDate;
    
    const finalSprints: MilestoneSprintInfo[] = configuredSprints.map((sd, i) => {
      const sStart = trackStart;
      const nextD = new Date(sd.deadline);
      nextD.setDate(nextD.getDate() + 1);
      trackStart = nextD.toISOString().slice(0, 10);
      
      const members = acceptedMembers.filter((m) => sd.memberIds.includes(m.id));

      return {
        id: `sprint-${i + 1}`,
        name: `Sprint ${i + 1}`,
        startDate: sStart,
        endDate: sd.deadline,
        status: i === 0 ? "active" : "upcoming",
        assignees: members.map((m) => `${m.name} / ${m.role}`).join(", "),
        inviteLink: `https://weflow.app/invite/${milestoneId}-sprint-${i + 1}`,
        goalSummary: sd.goal,
        description: sd.description,
        memberIds: sd.memberIds,
      };
    });

    // Calculate final endDate from sprints or default to 30 days later
    let finalEndDate = endDate;
    if (finalSprints.length > 0) {
      finalEndDate = finalSprints[finalSprints.length - 1].endDate;
    } else {
      const d = new Date(startDate);
      d.setDate(d.getDate() + 30);
      finalEndDate = d.toISOString().slice(0, 10);
    }

    const args: CreateMilestoneArgs = {
      name: name.trim(),
      description: description.trim(),
      expectedOutcome: expectedOutcome.trim(),
      startDate,
      endDate: finalEndDate,
      workspaceId,
      configuredSprints: finalSprints,
    };
    
    const result = await createMilestone.mutateAsync(args);
    onCreated(result);
  }

  const isDetailsPhase = phase === "details";
  const isOverviewPhase = phase === "overview";
  const isSprintPhase = phase === "sprint-form";
  const isLastStep = isSprintPhase && sprintForm.step === 3;

  const modalTitle = isDetailsPhase
    ? "Create milestone"
    : isOverviewPhase
      ? "Add Sprints"
      : currentOption === "custom" 
        ? `Configure Sprint ${configuredSprints.length + 1}`
        : `Configure Sprint ${createdSprintsInBatch + 1} of ${targetSprintsCount}`;

  const modalSubtitle = isDetailsPhase
    ? "Set the specific goal for Startup-"
    : isOverviewPhase
      ? "Select duration for your sprints"
      : [
          "Set the sprint goal and timeline.",
          "Select who will work on this sprint.",
          "Assign tasks to your team members.",
        ][sprintForm.step - 1];

  return (
    <dialog
      open
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-transparent border-none outline-none w-full h-full max-w-full max-h-full m-0 pointer-events-auto"
      data-ocid="create-milestone.dialog"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm cursor-default"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        className={cn(
          "relative z-10 w-full bg-card rounded-2xl shadow-2xl border border-border overflow-hidden pointer-events-auto",
           isSprintPhase ? "max-w-[760px]" : "max-w-lg",
        )}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1 opacity-60">
                (pre-sprint)
              </span>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm">
                  {isSprintPhase ? (
                    <Rocket className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Flag className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-foreground font-display text-lg leading-tight tracking-tight">
                    {modalTitle}
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">{modalSubtitle}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isDetailsPhase && (
              <div className="w-8 h-8 rounded-full border-2 border-primary/30 flex items-center justify-center text-primary font-bold text-base shadow-sm bg-primary/10">
                {milestoneNumber}
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
              data-ocid="create-milestone.close_button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── DETAILS PHASE ───────────────────────────────────────────── */}
        {isDetailsPhase && (
          <>
            <div className="flex px-8 pt-4 gap-2">
              <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 shadow-sm" />
              <div className="h-1 flex-1 rounded-full bg-orange-100/50" />
            </div>

            <div className="px-8 py-8 space-y-6">
              {/* Goal Field */}
              <div className="space-y-2">
                <Label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-2" htmlFor="milestone-name">
                  Goal <span className="text-orange-500">*</span>
                </Label>
                <Input
                  id="milestone-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What is the main goal? (e.g. Beta Launch)"
                  className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all shadow-sm"
                  autoFocus
                  data-ocid="create-milestone.name.input"
                />
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <Label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-2" htmlFor="milestone-desc">
                  Description
                </Label>
                <Textarea
                  id="milestone-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us more about this milestone..."
                  className="w-full min-h-[100px] rounded-2xl border border-gray-200 bg-gray-50/50 p-5 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all shadow-sm resize-y"
                  data-ocid="create-milestone.description.textarea"
                />
              </div>

              {/* Expected Outcome Field */}
              <div className="space-y-2">
                <div className="flex flex-col ml-2">
                  <Label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest" htmlFor="milestone-outcome">
                    Expected Outcome
                  </Label>
                  <span className="text-[10px] text-gray-400 font-medium mt-0.5">
                    Explain the results or KPIs you expect.
                  </span>
                </div>
                <Textarea
                  id="milestone-outcome"
                  value={expectedOutcome}
                  onChange={(e) => setExpectedOutcome(e.target.value)}
                  placeholder="e.g. 500 new users, product market fit..."
                  className="w-full min-h-[100px] rounded-2xl border border-gray-200 bg-gray-50/50 p-5 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all shadow-sm resize-y"
                  data-ocid="create-milestone.outcome.textarea"
                />
              </div>

              {/* Timeline (Start + End) */}
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-2" htmlFor="start-date">
                      Start Date <span className="text-orange-500">*</span>
                    </Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      min={today}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all shadow-sm"
                      data-ocid="create-milestone.start-date.input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-2" htmlFor="end-date">
                      End Date
                    </Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      min={startDate || today}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all shadow-sm"
                      data-ocid="create-milestone.end-date.input"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <Button
                  className="h-12 px-10 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-[1.25rem] shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0"
                  onClick={handleMilestoneNext}
                  disabled={!name.trim() || !startDate}
                  data-ocid="create-milestone.next-button"
                >
                  Next step &rarr;
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ── OVERVIEW PHASE ───────────────────────────────────────────── */}
        {isOverviewPhase && (
          <>
            <div className="flex px-8 pt-4 gap-2">
              <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 shadow-sm" />
              <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 shadow-sm" />
            </div>
            <div className="px-8 py-5 space-y-6">
              <div className="space-y-3">
                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Configured Sprints ({configuredSprints.length})
                </p>
                {configuredSprints.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-8 bg-orange-50/50 border-2 border-dashed border-orange-200 rounded-2xl">
                    <Rocket className="w-8 h-8 text-orange-300 mb-2" />
                    <p className="text-[13px] font-bold text-orange-600/60 text-center">
                      No sprints added yet.<br/>Click an option below to start.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
                    {configuredSprints.map((s, i) => (
                      <div
                        key={i}
                        className="bg-white border border-gray-100 shadow-sm p-4 rounded-[1.25rem] flex items-center justify-between group hover:border-orange-200 hover:shadow-md transition-all"
                      >
                        <div className="flex gap-4 items-center">
                          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-black text-sm border border-orange-100 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                            S{i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 truncate max-w-[180px]">{s.goal}</p>
                            <p className="text-[12px] font-medium text-gray-400 truncate max-w-[180px]">{s.description || "No description"}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-orange-600 border-orange-200 bg-orange-50/50">
                          {s.deadline}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="pt-2">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-3">
                  Add Sprint
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-2xl border-orange-200 text-orange-600 font-bold hover:bg-orange-50 hover:border-orange-400 shadow-sm"
                    onClick={() => handleAddSprint(2)}
                  >
                    + 2 Sprints
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-2xl border-orange-200 text-orange-600 font-bold hover:bg-orange-50 hover:border-orange-400 shadow-sm"
                    onClick={() => handleAddSprint(4)}
                  >
                    + 4 Sprints
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-2xl border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-400 shadow-sm"
                    onClick={() => handleAddSprint("custom")}
                  >
                    + Custom
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                {!initialData && (
                  <Button
                    variant="outline"
                    className="flex-1 h-12 rounded-[1.25rem] border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                    onClick={() => setPhase("details")}
                  >
                    &larr; Back
                  </Button>
                )}
                <Button
                  className="flex-1 h-12 px-6 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-[1.25rem] shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 gap-2"
                  onClick={handleCreateMilestone}
                  disabled={configuredSprints.length === 0 || createMilestone.isPending}
                >
                  {createMilestone.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Flag className="w-5 h-5" />
                  )}
                  Finish Milestone
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ── SPRINT CONFIGURATION PHASE ───────────────────────────────── */}
        {isSprintPhase && (
          <>
            <div className="px-8 pt-4">
              <StepIndicator currentStep={sprintForm.step} />
            </div>

            <div className="px-8 pb-2">
              {sprintForm.step === 1 && (
                <SprintStep1
                  data={sprintForm.step1}
                  onChange={sprintForm.setStep1}
                  error={sprintForm.goalError}
                  startDate={currentSprintStart}
                  helperText={
                    currentOption === "custom"
                      ? `Select any deadline up to ${currentSprintMaxDeadline}.`
                      : `Based on ${currentOption}-day sprint. Max ${currentSprintMaxDeadline}.`
                  }
                />
              )}
              {sprintForm.step === 2 && (
                <SprintStep2
                  selectedIds={sprintForm.selectedMemberIds}
                  onToggle={sprintForm.toggleMember}
                  error={sprintForm.teamError}
                  members={acceptedMembers}
                />
              )}

              {sprintForm.step === 3 && (
                <SprintStep3
                  selectedMembers={sprintForm.selectedMembers}
                  assignments={sprintForm.assignments}
                  onAssign={sprintForm.assignTask}
                  onUnassign={sprintForm.unassignTask}
                  onAddNewTask={sprintForm.addNewTask}
                />
              )}
            </div>

            <div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 bg-gray-50/50 mt-4 rounded-b-2xl">
              <Button
                type="button"
                variant="outline"
                className="h-12 px-6 rounded-[1.25rem] border-gray-200 text-gray-600 font-bold hover:bg-gray-50"
                onClick={handleSprintPhaseBack}
              >
                &larr; Back
              </Button>

              {!isLastStep ? (
                <Button
                  type="button"
                  className="h-12 px-8 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-[1.25rem] shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 gap-2"
                  onClick={handleSprintNext}
                >
                  Next <ChevronRight className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  className="h-12 px-8 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-[1.25rem] shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 gap-2"
                  onClick={handleSprintFinish}
                >
                  {createdSprintsInBatch + 1 < targetSprintsCount ? `Next Sprint (${createdSprintsInBatch + 2}/${targetSprintsCount})` : "Save Sprint"}
                  <Check className="w-5 h-5" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}

function EmptyMilestones({
  isCreator,
  onCreate,
}: { isCreator: boolean; onCreate: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Flag className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold font-display text-foreground mb-2">
          No Milestones Yet
        </h2>
        <p className="text-muted-foreground text-sm mb-8">
          Milestones group sprints around a major product goal — launch, feature
          release, or any significant deliverable.
        </p>
        {isCreator && (
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex flex-col items-center gap-3 w-full max-w-xs mx-auto p-6 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-all group cursor-pointer"
            data-ocid="create-milestone.empty_state"
          >
            <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Plus className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold text-foreground text-lg font-display">
                Create Milestone
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set a name, dates, and sprint structure
              </p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Milestones() {
  const { data: workspace } = useWorkspace();
  const workspaceId = workspace?.id ?? "default";
  const { data: isCreator = false } = useIsWorkspaceCreator(workspaceId);
  const { data: milestones = [], isLoading } = useMilestones(workspaceId);
  const [showModal, setShowModal] = useState(false);
  const [showSprintModal, setShowSprintModal] = useState(false);
  const [activeMilestoneId, setActiveMilestoneId] = useState<string | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<"active" | "create" | "upcoming" | "archived">("active");
  const [expandedMilestoneId, setExpandedMilestoneId] = useState<string | null>(null);
  const [isCreatingNewMilestone, setIsCreatingNewMilestone] = useState(false);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newDeadline, setNewDeadline] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

  const { user } = useAuthStore();
  const createMilestone = useCreateMilestone();
  const deleteMilestone = useDeleteMilestone();
  const firstName = user?.name?.split(" ")[0] || "Hira";
  const addSprintToMilestone = useAddSprintToMilestone();

  function handleCreated(m: Milestone) {
    setShowModal(false);
    setActiveMilestoneId(m.id);
  }

  const [hasPrompted, setHasPrompted] = useState(false);

  useEffect(() => {
    if (milestones.length > 0 && !activeMilestoneId) {
      setActiveMilestoneId(milestones[0].id);
    }
  }, [milestones, activeMilestoneId]);

  // Auto-open modal for new creators who have no milestones yet
  useEffect(() => {
    if (!isLoading && milestones.length === 0 && isCreator && !hasPrompted) {
      setShowModal(true);
      setHasPrompted(true);
    }
  }, [isLoading, milestones.length, isCreator, hasPrompted]);

  const activeMilestone = milestones.find((m) => m.id === activeMilestoneId);
  const hasMultiple = milestones.length > 1;

  function handleAddSprint(
    sprint: Omit<Sprint, "id" | "taskIds" | "velocity">,
    _members: WorkspaceMember[],
  ) {
    if (!activeMilestoneId) return;
    const newSprint: MilestoneSprintInfo = {
      id: `${activeMilestoneId}-custom-${Date.now()}`,
      name: sprint.name,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      status: sprint.status,
      assignees: _members.map((m) => `${m.name} / ${m.role}`).join(", "),
      inviteLink: `https://weflow.app/invite/${activeMilestoneId}-custom-${Date.now()}`,
      goalSummary: sprint.goalSummary,
    };
    addSprintToMilestone.mutate({
      milestoneId: activeMilestoneId,
      workspaceId,
      sprint: newSprint,
    });
    setShowSprintModal(false);
  }

  return (
    <Layout>
      <div className="flex-1 overflow-y-auto bg-[#F9F9FB] flex flex-col font-sans w-full">
        {/* ── Header ── */}
        <div className="px-6 py-8 flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <h1 className="text-[28px] font-bold text-[#1A1A1A] flex items-center gap-2">
              Hi, {firstName} <span className="animate-bounce">👋</span>
            </h1>
            <div className="w-5 h-5 rounded-full border border-green-500 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-500" />
            </div>
          </div>
        </div>

        {/* ── Tabs Navigation ── */}
        <div className="px-6 mb-8 w-full">
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-1.5 flex items-center justify-between shadow-sm w-full">
            <button
              onClick={() => setActiveTab("active")}
              className={cn(
                "flex items-center gap-3 px-6 py-3.5 rounded-xl transition-all min-w-max",
                activeTab === "active" ? "bg-[#F3F4FF] border border-[#6366F1]/20" : "hover:bg-gray-50"
              )}
            >
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center transition-colors", activeTab === "active" ? "text-[#6366F1]" : "text-gray-400")}>
                <Flag className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className={cn("text-sm font-bold leading-tight", activeTab === "active" ? "text-[#6366F1]" : "text-gray-400")}>Milestone</p>
                <p className="text-[10px] font-medium text-gray-400 uppercase tracking-tight">Track Your Goal</p>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("create")}
                className={cn(
                  "flex items-center gap-3 px-6 py-3.5 rounded-xl transition-all min-w-max",
                  activeTab === "create" ? "bg-[#F3F4FF] border border-[#6366F1]/20" : "hover:bg-gray-50"
                )}
              >
                <Plus className={cn("w-6 h-6", activeTab === "create" ? "text-green-500" : "text-gray-400")} />
                <span className={cn("text-sm font-bold", activeTab === "create" ? "text-[#1A1A1A]" : "text-gray-400")}>Create New</span>
              </button>

              <button
                onClick={() => setActiveTab("upcoming")}
                className={cn(
                  "flex items-center gap-3 px-6 py-3.5 rounded-xl transition-all min-w-max",
                  activeTab === "upcoming" ? "bg-[#F3F4FF] border border-[#6366F1]/20" : "hover:bg-gray-50"
                )}
              >
                <Calendar className={cn("w-5 h-5", activeTab === "upcoming" ? "text-orange-500" : "text-gray-400")} />
                <span className={cn("text-sm font-bold", activeTab === "upcoming" ? "text-[#1A1A1A]" : "text-gray-400")}>Upcoming</span>
              </button>

              <button
                onClick={() => setActiveTab("archived")}
                className={cn(
                  "flex items-center gap-3 px-6 py-3.5 rounded-xl transition-all min-w-max", activeTab === "archived" ? "bg-[#F3F4FF] border border-[#6366F1]/20" : "hover:bg-gray-50"
                )}
              >
                <Archive className={cn("w-5 h-5", activeTab === "archived" ? "text-blue-500" : "text-gray-400")} />
                <span className={cn("text-sm font-bold", activeTab === "archived" ? "text-[#1A1A1A]" : "text-gray-400")}>Archived</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Content Area ── */}
        <div className="px-6 pb-10 flex-1 w-full">
          {activeTab === "active" && (
            <div className="w-full">
              <h2 className="text-[22px] font-bold text-[#6366F1] mb-6 border-b-2 border-[#6366F1] w-max pb-1">Active Milestone</h2>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#6366F1]" /></div>
                ) : milestones.length === 0 ? (
                  <div className="bg-white border border-[#E5E5E5] rounded-3xl p-12 text-center shadow-sm">
                    <p className="text-gray-500 font-medium">No active milestones found.</p>
                    <Button onClick={() => setActiveTab("create")} variant="link" className="text-[#6366F1] font-bold mt-2">Create your first milestone &rarr;</Button>
                  </div>
                ) : (
                  milestones.map((m) => (
                    <div key={m.id} className="bg-white border border-[#E5E5E5] rounded-[24px] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      <div 
                        className="p-5 flex items-center justify-between cursor-pointer group"
                        onClick={() => setExpandedMilestoneId(expandedMilestoneId === m.id ? null : m.id)}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-gray-400 group-hover:text-[#6366F1] transition-colors">
                            {expandedMilestoneId === m.id ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                          </div>
                          <h3 className="text-[17px] font-bold text-[#1A1A1A] min-w-[200px]">{m.name}</h3>
                          <p className="text-sm font-medium text-gray-500 flex-1">
                            {new Date(m.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} — {new Date(m.endDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} ({daysBetween(m.startDate, m.endDate)} days)
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <Badge variant="outline" className="bg-[#F3F4FF] text-[#6366F1] border-none px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-tight shadow-sm">
                            {m.sprints.length} Sprints
                          </Badge>
                          {new Date(m.endDate) < new Date() ? (
                            <Badge variant="outline" className="bg-[#F0FDF4] text-[#15803D] border-none px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-tight shadow-sm">
                              Completed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-[#FFFBEB] text-[#B45309] border-none px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-tight shadow-sm">
                              Pending
                            </Badge>
                          )}
                          <div className="h-8 w-px bg-gray-200 mx-2" />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Delete milestone "${m.name}"? This will also delete all its sprints.`)) {
                                deleteMilestone.mutate({ id: m.id, workspaceId });
                                if (activeMilestoneId === m.id) setActiveMilestoneId(null);
                                if (expandedMilestoneId === m.id) setExpandedMilestoneId(null);
                              }
                            }}
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>

                      {expandedMilestoneId === m.id && (
                        <div className="px-16 pb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                          <div className="bg-[#F9F9FB] border border-[#E5E5E5] rounded-[20px] p-6 space-y-4">
                            <div>
                              <p className="text-sm font-bold text-[#1A1A1A] mb-2">Goal Description</p>
                              <p className="text-sm text-gray-600 leading-relaxed italic">
                                {m.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
                              </p>
                            </div>
                            <div className="pt-2">
                              <p className="text-sm font-bold text-[#1A1A1A] mb-1">Team</p>
                              <p className="text-sm text-gray-600 font-medium">Team {m.sprints.length + 10}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "create" && (
            <div className="w-full bg-white border border-[#E5E5E5] rounded-[32px] p-12 shadow-sm">
               <div className="flex flex-col items-center justify-center text-center mb-8">
                <span className="text-[11px] font-black text-orange-500 uppercase tracking-[0.4em] mb-3">
                  New Milestone
                </span>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  Define Your Goal
                </h2>
                <p className="text-sm font-medium text-gray-500 mt-3 max-w-sm">
                  What is the primary objective for your startup this month?
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-2">
                    Milestone Name <span className="text-orange-500">*</span>
                  </label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Beta Launch"
                    className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-2">
                    Description
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="What does success look like for this milestone?"
                    className="w-full min-h-[140px] rounded-2xl border border-gray-200 bg-gray-50/50 p-5 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all shadow-sm resize-y"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={newStartDate}
                      onChange={(e) => setNewStartDate(e.target.value)}
                      className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[12px] font-bold text-gray-400 uppercase tracking-widest ml-2">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="w-full h-14 rounded-2xl border border-gray-200 bg-gray-50/50 px-5 text-[15px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 focus:bg-white transition-all shadow-sm"
                    />
                  </div>
                </div>

                <Button 
                  onClick={() => {
                    if (!newName.trim()) return;
                    setActiveMilestoneId(null);
                    setIsCreatingNewMilestone(true);
                    setShowSprintModal(true);
                  }}
                  disabled={!newName.trim()}
                  className="w-full h-14 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all mt-4"
                >
                  Create Milestone
                </Button>
              </div>
            </div>
          )}

          {(activeTab === "upcoming" || activeTab === "archived") && (
            <div className="flex flex-col items-center justify-center py-24 bg-white border border-[#E5E5E5] rounded-[32px] shadow-sm">
              <div className="w-20 h-20 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                {activeTab === "upcoming" ? <Calendar className="w-10 h-10 text-orange-300" /> : <Archive className="w-10 h-10 text-blue-300" />}
              </div>
              <p className="text-lg font-bold text-gray-900 capitalize">No {activeTab} milestones</p>
              <p className="text-sm text-gray-500 mt-1">There are currently no items in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* CreateMilestoneModal: Used to create a BRAND NEW milestone with sprints */}
      {showSprintModal && isCreatingNewMilestone && (
        <CreateMilestoneModal
          workspaceId={workspaceId}
          onClose={() => {
            setShowSprintModal(false);
            setIsCreatingNewMilestone(false);
          }}
          onCreated={(m) => {
            setShowSprintModal(false);
            setIsCreatingNewMilestone(false);
            setActiveMilestoneId(m.id);
            setActiveTab("active");
            setNewName("");
            setNewDescription("");
          }}
          milestoneNumber={(milestones.length + 1)}
          initialData={{
            name: newName,
            description: newDescription,
            startDate: newStartDate,
            endDate: newDeadline
          }}
        />
      )}

      {/* NewSprintModal: Used to add an individual sprint to an EXISTING milestone */}
      {showSprintModal && !isCreatingNewMilestone && activeMilestone && (
         <NewSprintModal
          open={showSprintModal}
          onClose={() => setShowSprintModal(false)}
          onAdd={handleAddSprint}
          nextSprintNumber={(activeMilestone.sprints.length ?? 0) + 1}
          milestoneDeadline={new Date(activeMilestone.endDate)}
        />
      )}
    </Layout>
  );
}
