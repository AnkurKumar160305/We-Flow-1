import type {
  Sprint,
  Task,
  TaskBucket,
  TeamHealth,
  UserProfile,
  Workspace,
  WorkspaceMember,
} from "../types";

export const MOCK_MEMBERS: WorkspaceMember[] = [];

export const MOCK_WORKSPACE: Workspace = {
  id: "ws-empty",
  name: "My Workspace",
  tagline: "",
  description: "",
  vision: "",
  members: [],
  departments: [],
  createdAt: new Date().toISOString(),
};

export const MOCK_SPRINTS: Sprint[] = [];

export const MOCK_TASKS: Task[] = [];

export const MOCK_BUCKETS: TaskBucket[] = [];

export const MOCK_TEAM_HEALTH: TeamHealth = {
  overallScore: 0,
  blockedCount: 0,
  onTrackCount: 0,
  atRiskCount: 0,
  completionRate: 0,
  velocityTrend: "flat",
};
