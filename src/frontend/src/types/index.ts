// ─── Core entity types for WeFlow ───────────────────────────────────────────

export type DepartmentColor =
  | "orange"
  | "blue"
  | "green"
  | "purple"
  | "pink"
  | "teal"
  | "red"
  | "yellow";

export interface Department {
  id: string;
  name: string;
  color: DepartmentColor;
  abbreviation: string;
}

export type TaskStatus = "todo" | "doing" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type DoneSubLabel = "needs_review" | "shipped" | null;

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  doneSubLabel?: DoneSubLabel;
  priority: TaskPriority;
  departmentId: string;
  assigneeId?: string;
  sprintId?: string;
  bucketId?: string;
  dueDate?: string; // ISO date string
  progress?: number; // 0-100, used for "doing" tasks
  isBlocked?: boolean;
  blockerNote?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

export type SprintStatus = "upcoming" | "active" | "completed";

export interface Sprint {
  id: string;
  name: string;
  status: SprintStatus;
  startDate: string;
  endDate: string;
  goalSummary?: string;
  taskIds: string[];
  velocity?: number;
}

export interface Column {
  id: TaskStatus;
  title: string;
  taskIds: string[];
}

export interface TaskBucket {
  id: string;
  name: string;
  color: DepartmentColor;
  sprintId: string;
  taskIds: string[];
}

export type MemberRole = "owner" | "admin" | "member" | "viewer";

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  departmentId?: string;
  avatarUrl?: string;
  initials: string;
  tasksCompleted?: number;
  tasksInProgress?: number;
  isOnline?: boolean;
}

export interface TeamHealth {
  overallScore: number; // 0-100
  blockedCount: number;
  onTrackCount: number;
  atRiskCount: number;
  completionRate: number; // 0-100
  velocityTrend: "up" | "down" | "stable";
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
  workspaceId: string;
  role: MemberRole;
  departmentId?: string;
  onboardingCompleted: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  members: WorkspaceMember[];
  departments: Department[];
  createdAt: string;
}

export type OnboardingStep = 1 | 2 | 3 | 4;

export interface OnboardingState {
  step: OnboardingStep;
  workspaceName: string;
  teamSize: string;
  departments: string[];
  inviteEmails: string[];
  role: string;
}

// ─── Board view types ────────────────────────────────────────────────────────

export interface BoardColumn {
  id: TaskStatus;
  title: string;
  count: number;
  tasks: Task[];
}

export interface KanbanBoard {
  sprintId: string;
  columns: BoardColumn[];
}

// ─── Milestone types ─────────────────────────────────────────────────────────

// Removed SprintTemplate (replaced by discrete sprint additions)

export interface MilestoneSprintInfo {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  assignees: string; // free-form "name/role" text
  inviteLink?: string;
  goalSummary?: string;
  description?: string;
  memberIds?: string[];
}

export interface Milestone {
  id: string;
  workspaceId: string;
  name: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  createdBy: string;
  createdAt: string;
  sprints: MilestoneSprintInfo[];
}

export interface CreateMilestoneArgs {
  name: string;
  startDate: string;
  endDate: string;
  workspaceId: string;
  /** Pre-configured sprint data from the sprint setup flow */
  configuredSprints?: MilestoneSprintInfo[];
}

// ─── Sprint configuration data collected during milestone creation ───────────

export interface MemberTaskAssignment {
  memberId: string;
  taskIds: string[];
  newTasks: string[];
}

export interface SprintFormData {
  goal: string;
  description: string;
  deadline: string;
  memberIds: string[];
  assignments: MemberTaskAssignment[];
}

// ─── Department color map ────────────────────────────────────────────────────

export const DEPT_COLORS: Record<
  DepartmentColor,
  { bg: string; text: string; dot: string }
> = {
  orange: {
    bg: "bg-orange-500/10 dark:bg-orange-400/15",
    text: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500 dark:bg-orange-400",
  },
  blue: {
    bg: "bg-blue-500/10 dark:bg-blue-400/15",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500 dark:bg-blue-400",
  },
  green: {
    bg: "bg-green-500/10 dark:bg-green-400/15",
    text: "text-green-700 dark:text-green-300",
    dot: "bg-green-500 dark:bg-green-400",
  },
  purple: {
    bg: "bg-purple-500/10 dark:bg-purple-400/15",
    text: "text-purple-700 dark:text-purple-300",
    dot: "bg-purple-500 dark:bg-purple-400",
  },
  pink: {
    bg: "bg-pink-500/10 dark:bg-pink-400/15",
    text: "text-pink-700 dark:text-pink-300",
    dot: "bg-pink-500 dark:bg-pink-400",
  },
  teal: {
    bg: "bg-teal-500/10 dark:bg-teal-400/15",
    text: "text-teal-700 dark:text-teal-300",
    dot: "bg-teal-500 dark:bg-teal-400",
  },
  red: {
    bg: "bg-red-500/10 dark:bg-red-400/15",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500 dark:bg-red-400",
  },
  yellow: {
    bg: "bg-yellow-500/10 dark:bg-yellow-400/15",
    text: "text-yellow-700 dark:text-yellow-300",
    dot: "bg-yellow-500 dark:bg-yellow-400",
  },
};

export const DEPARTMENTS: Department[] = [
  {
    id: "engineering",
    name: "Engineering",
    color: "blue",
    abbreviation: "ENG",
  },
  { id: "design", name: "Design", color: "purple", abbreviation: "DES" },
  { id: "product", name: "Product", color: "orange", abbreviation: "PRD" },
  { id: "marketing", name: "Marketing", color: "pink", abbreviation: "MKT" },
  { id: "data", name: "Data", color: "teal", abbreviation: "DAT" },
  { id: "ops", name: "Operations", color: "green", abbreviation: "OPS" },
];
