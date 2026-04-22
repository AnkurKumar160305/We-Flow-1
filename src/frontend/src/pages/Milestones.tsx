import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardList,
  Copy,
  Flag,
  Link2,
  Loader2,
  Plus,
  Rocket,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Layout } from "../components/Layout";
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
  useIsWorkspaceCreator,
  useMilestones,
  useUpdateMilestoneSprintAssignees,
  useWorkspace,
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
        <Input
          value={assignees}
          onChange={(e) => handleAssigneesChange(e.target.value)}
          placeholder="e.g. Alex Chen / Engineer, Maya Patel / Designer"
          className="text-xs h-8 bg-background"
          data-ocid={`sprint-assignees.item.${index + 1}`}
        />
        <p className="text-[10px] text-muted-foreground">
          Use Name / Role format, comma-separated for multiple
        </p>
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
//   Phase "overview"  → View added sprints, select duration (+ 2 Days / + 4 Days / + Custom)
//   Phase "sprint-form" → Configure an individual sprint
//   After finishing milestone → createMilestone with all collected sprints

interface CreateModalProps {
  workspaceId: string;
  onClose: () => void;
  onCreated: (m: Milestone) => void;
}

type ModalPhase = "details" | "overview" | "sprint-form";
type SprintDurationOption = 2 | 4 | "custom";

function CreateMilestoneModal({
  workspaceId,
  onClose,
  onCreated,
}: CreateModalProps) {
  const [phase, setPhase] = useState<ModalPhase>("details");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [configuredSprints, setConfiguredSprints] = useState<SprintFormData[]>([]);
  const [currentOption, setCurrentOption] = useState<SprintDurationOption | null>(null);

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

  const sprintForm = useSprintFormState(currentSprintDeadline);
  const resetSprintForm = sprintForm.reset;

  useEffect(() => {
    if (phase === "sprint-form") {
      resetSprintForm(currentSprintDeadline);
    }
  }, [phase, currentSprintDeadline, resetSprintForm]);

  function handleMilestoneNext() {
    if (!name.trim() || !startDate || !endDate) return;
    setPhase("overview");
  }

  function handleAddSprint(option: SprintDurationOption) {
    setCurrentOption(option);
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
    setPhase("overview");
    setCurrentOption(null);
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
      
      const members = MOCK_MEMBERS.filter((m) => sd.memberIds.includes(m.id));
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

    const args: CreateMilestoneArgs = {
      name: name.trim(),
      startDate,
      endDate,
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
    ? "Create Milestone"
    : isOverviewPhase
      ? "Add Sprints"
      : `Configure Sprint ${configuredSprints.length + 1}`;

  const modalSubtitle = isDetailsPhase
    ? "Step 1 of 2 — Details"
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
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              {isSprintPhase ? (
                <Rocket className="w-4 h-4 text-primary-foreground" />
              ) : (
                <Flag className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-foreground font-display text-base leading-tight">
                {modalTitle}
              </h2>
              <p className="text-xs text-muted-foreground">{modalSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            data-ocid="create-milestone.close_button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── DETAILS PHASE ───────────────────────────────────────────── */}
        {isDetailsPhase && (
          <>
            <div className="flex px-6 pt-4 gap-2">
              <div className="h-1 flex-1 rounded-full bg-primary" />
              <div className="h-1 flex-1 rounded-full bg-muted" />
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold" htmlFor="milestone-name">
                  Milestone Name
                </Label>
                <Input
                  id="milestone-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Public Beta Launch"
                  className="bg-background"
                  autoFocus
                  data-ocid="create-milestone.name.input"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold" htmlFor="start-date">
                    Start Date
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    min={today}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-background"
                    data-ocid="create-milestone.start-date.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold" htmlFor="end-date">
                    End Date
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    min={startDate || today}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-background"
                    data-ocid="create-milestone.end-date.input"
                  />
                </div>
              </div>

              <Button
                className="w-full bg-primary hover:bg-primary/90 gap-2 mt-2"
                onClick={handleMilestoneNext}
                disabled={!name.trim() || !startDate || !endDate}
                data-ocid="create-milestone.next_button"
              >
                Next: Add Sprints
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}

        {/* ── OVERVIEW PHASE ───────────────────────────────────────────── */}
        {isOverviewPhase && (
          <>
            <div className="flex px-6 pt-4 gap-2">
              <div className="h-1 flex-1 rounded-full bg-primary" />
              <div className="h-1 flex-1 rounded-full bg-primary" />
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-foreground">
                  Configured Sprints ({configuredSprints.length})
                </p>
                {configuredSprints.length === 0 ? (
                  <p className="text-xs text-muted-foreground border-2 border-dashed border-border p-4 rounded-xl text-center">
                    No sprints added yet. Click an option below to start.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {configuredSprints.map((s, i) => (
                      <div
                        key={i}
                        className="bg-card border border-border p-3 rounded-lg flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold font-display">Sprint {i + 1}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{s.goal}</p>
                        </div>
                        <Badge variant="outline">{s.deadline}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="pt-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Add Sprint
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-primary/40 text-primary hover:bg-primary/5 hover:border-primary/60"
                    onClick={() => handleAddSprint(2)}
                  >
                    + 2 Days
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-primary/40 text-primary hover:bg-primary/5 hover:border-primary/60"
                    onClick={() => handleAddSprint(4)}
                  >
                    + 4 Days
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-primary/40 text-primary hover:bg-primary/5 hover:border-primary/60"
                    onClick={() => handleAddSprint("custom")}
                  >
                    + Custom
                  </Button>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-border mt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setPhase("details")}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 gap-2"
                  onClick={handleCreateMilestone}
                  disabled={configuredSprints.length === 0 || createMilestone.isPending}
                >
                  {createMilestone.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Flag className="w-4 h-4" />
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

            <div className="flex items-center justify-between px-8 py-5 border-t border-border bg-muted/20 mt-4">
              <Button
                type="button"
                variant={sprintForm.step === 1 ? "ghost" : "outline"}
                size="sm"
                onClick={handleSprintPhaseBack}
              >
                ← Back
              </Button>

              {!isLastStep ? (
                <Button
                  type="button"
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 font-semibold px-5"
                  onClick={handleSprintNext}
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 gap-2 shadow-md"
                  onClick={handleSprintFinish}
                >
                  Save Sprint <Check className="w-4 h-4" />
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
  const addSprintToMilestone = useAddSprintToMilestone();

  function handleCreated(m: Milestone) {
    setShowModal(false);
    setActiveMilestoneId(m.id);
  }

  useEffect(() => {
    if (milestones.length > 0 && !activeMilestoneId) {
      setActiveMilestoneId(milestones[0].id);
    }
  }, [milestones, activeMilestoneId]);

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
      <div className="flex-1 overflow-y-auto bg-background flex flex-col">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4 flex-shrink-0">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold font-display text-foreground flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary" />
                Milestones
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Track major product goals across sprints
              </p>
            </div>
            {isCreator && (
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 gap-1.5 flex-shrink-0"
                onClick={() => setShowModal(true)}
                data-ocid="new-milestone.primary_button"
              >
                <Plus className="w-4 h-4" />
                New Milestone
              </Button>
            )}
          </div>
        </div>

        {/* Milestone tabs — only when there are multiple */}
        {hasMultiple && (
          <div className="bg-muted/30 border-b border-border px-6 py-2 flex-shrink-0">
            <div className="max-w-3xl mx-auto flex items-center gap-1.5 overflow-x-auto">
              {milestones.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveMilestoneId(m.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                    activeMilestoneId === m.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  data-ocid={`milestone-tab.${m.id}`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content area */}
        <div className="flex-1 flex flex-col">
          {isLoading ? (
            <div
              className="flex-1 flex items-center justify-center"
              data-ocid="milestones.loading_state"
            >
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : milestones.length === 0 ? (
            <EmptyMilestones
              isCreator={isCreator}
              onCreate={() => setShowModal(true)}
            />
          ) : activeMilestone ? (
            <div className="max-w-3xl mx-auto w-full px-6 py-6">
              <MilestoneDetail
                milestone={activeMilestone}
                workspaceId={workspaceId}
                onNewSprint={() => setShowSprintModal(true)}
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Create Milestone modal (includes inline sprint config phase) */}
      {showModal && (
        <CreateMilestoneModal
          workspaceId={workspaceId}
          onClose={() => setShowModal(false)}
          onCreated={handleCreated}
        />
      )}

      {/* New Sprint modal — for adding extra sprints to existing milestones */}
      <NewSprintModal
        open={showSprintModal}
        onClose={() => setShowSprintModal(false)}
        onAdd={handleAddSprint}
        nextSprintNumber={(activeMilestone?.sprints.length ?? 0) + 1}
        milestoneDeadline={
          activeMilestone ? new Date(activeMilestone.endDate) : undefined
        }
      />
    </Layout>
  );
}
