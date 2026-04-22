import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  MOCK_BUCKETS,
  MOCK_MEMBERS,
  MOCK_PROFILE,
  MOCK_SPRINTS,
  MOCK_TASKS,
  MOCK_TEAM_HEALTH,
  MOCK_WORKSPACE,
} from "../data/mockData";
import type {
  CreateMilestoneArgs,
  Milestone,
  MilestoneSprintInfo,
  Sprint,
  Task,
  TaskBucket,
  TeamHealth,
  UserProfile,
  Workspace,
  WorkspaceMember,
} from "../types";

// ─── Profile ─────────────────────────────────────────────────────────────────

export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: async () => MOCK_PROFILE,
    enabled: true,
    initialData: MOCK_PROFILE,
  });
}

// ─── Workspace ───────────────────────────────────────────────────────────────

export function useWorkspace() {
  return useQuery<Workspace>({
    queryKey: ["workspace"],
    queryFn: async () => MOCK_WORKSPACE,
    enabled: true,
    initialData: MOCK_WORKSPACE,
  });
}

// ─── Sprints ─────────────────────────────────────────────────────────────────

export function useSprints() {
  return useQuery<Sprint[]>({
    queryKey: ["sprints"],
    queryFn: async () => MOCK_SPRINTS,
    enabled: true,
    initialData: MOCK_SPRINTS,
  });
}

export function useActiveSprint() {
  const { data: sprints = [] } = useSprints();
  return sprints.find((s) => s.status === "active") ?? sprints[0];
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export function useTasks(sprintId?: string) {
  return useQuery<Task[]>({
    queryKey: ["tasks", sprintId],
    queryFn: async () => {
      return sprintId
        ? MOCK_TASKS.filter((t) => t.sprintId === sprintId)
        : MOCK_TASKS;
    },
    enabled: true,
    initialData: sprintId
      ? MOCK_TASKS.filter((t) => t.sprintId === sprintId)
      : MOCK_TASKS,
  });
}

// ─── Team Members ─────────────────────────────────────────────────────────────

export function useTeamMembers() {
  return useQuery<WorkspaceMember[]>({
    queryKey: ["teamMembers"],
    queryFn: async () => MOCK_MEMBERS,
    enabled: true,
    initialData: MOCK_MEMBERS,
  });
}

// ─── Buckets ─────────────────────────────────────────────────────────────────

export function useBuckets(sprintId?: string) {
  return useQuery<TaskBucket[]>({
    queryKey: ["buckets", sprintId],
    queryFn: async () => {
      return sprintId
        ? MOCK_BUCKETS.filter((b) => b.sprintId === sprintId)
        : MOCK_BUCKETS;
    },
    enabled: true,
    initialData: sprintId
      ? MOCK_BUCKETS.filter((b) => b.sprintId === sprintId)
      : MOCK_BUCKETS,
  });
}

// ─── Team Health ──────────────────────────────────────────────────────────────

export function useTeamHealth() {
  return useQuery<TeamHealth>({
    queryKey: ["teamHealth"],
    queryFn: async () => MOCK_TEAM_HEALTH,
    enabled: true,
    initialData: MOCK_TEAM_HEALTH,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      const newTask: Task = {
        ...task,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return newTask;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Partial<Task> & { id: string }) => {
      return { ...updates, updatedAt: new Date().toISOString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// ─── Workspace Creator Check ──────────────────────────────────────────────────
// In this mock setup the profile owner is always the workspace creator.

export function useIsWorkspaceCreator(_workspaceId: string) {
  return useQuery<boolean>({
    queryKey: ["isWorkspaceCreator", _workspaceId],
    queryFn: async () => true, // mock: current user is always creator
    enabled: true,
    initialData: true,
  });
}

// ─── Milestones ───────────────────────────────────────────────────────────────

// In-memory store for milestones (simulates backend persistence in mock mode).
const MILESTONE_STORE: Milestone[] = [];

function buildSprintsFallback(
  milestoneStart: string,
  milestoneId: string,
): MilestoneSprintInfo[] {
  // If no sprints were configured, we start with an empty milestone anyway,
  // but to preserve the type safety and avoid breaking anything, we just return empty array.
  return [];
}

export function useMilestones(workspaceId: string) {
  return useQuery<Milestone[]>({
    queryKey: ["milestones", workspaceId],
    queryFn: async () =>
      MILESTONE_STORE.filter((m) => m.workspaceId === workspaceId),
    enabled: !!workspaceId,
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: CreateMilestoneArgs): Promise<Milestone> => {
      const id = `milestone-${Date.now()}`;
      // Use pre-configured sprints if provided (from the sprint setup flow),
      // otherwise fall back to auto-generated blank sprints.
      const sprints = args.configuredSprints?.length
        ? args.configuredSprints.map((s) => ({ ...s, id: `${id}-${s.id}` }))
        : buildSprintsFallback(args.startDate, id);
      const newMilestone: Milestone = {
        id,
        workspaceId: args.workspaceId,
        name: args.name,
        startDate: args.startDate,
        endDate: args.endDate,
        createdBy: MOCK_PROFILE.id,
        createdAt: new Date().toISOString(),
        sprints,
      };
      MILESTONE_STORE.push(newMilestone);
      return newMilestone;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["milestones", variables.workspaceId],
      });
    },
  });
}

export function useGetSprintInviteLink(sprintId: string) {
  return useQuery<string>({
    queryKey: ["sprintInviteLink", sprintId],
    queryFn: async () => `https://weflow.app/invite/${sprintId}`,
    enabled: !!sprintId,
  });
}

export function useAddSprintToMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      milestoneId,
      sprint,
    }: {
      milestoneId: string;
      workspaceId: string;
      sprint: MilestoneSprintInfo;
    }) => {
      const milestone = MILESTONE_STORE.find((m) => m.id === milestoneId);
      if (milestone) {
        milestone.sprints.push(sprint);
      }
      return sprint;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["milestones", variables.workspaceId],
      });
    },
  });
}

export function useUpdateMilestoneSprintAssignees() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      milestoneId,
      sprintId,
      assignees,
      workspaceId,
    }: {
      milestoneId: string;
      sprintId: string;
      assignees: string;
      workspaceId: string;
    }) => {
      const milestone = MILESTONE_STORE.find((m) => m.id === milestoneId);
      if (milestone) {
        const sprint = milestone.sprints.find((s) => s.id === sprintId);
        if (sprint) sprint.assignees = assignees;
      }
      return { milestoneId, sprintId, assignees, workspaceId };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["milestones", variables.workspaceId],
      });
    },
  });
}
