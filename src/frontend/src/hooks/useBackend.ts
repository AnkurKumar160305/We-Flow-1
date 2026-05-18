import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "./useAuthStore";
import axios from "axios";
import {
  MOCK_BUCKETS,
  MOCK_MEMBERS,
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

const BASE_URL = import.meta.env.VITE_API_URL || "";
const API_URL = `${BASE_URL}/api/data`;

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ─── Profile ─────────────────────────────────────────────────────────────────

export function useProfile() {
  const user = useAuthStore((state) => state.user);
  
  const fallbackProfile: UserProfile = {
    id: "temp-user",
    name: "Guest User",
    email: "guest@example.com",
    initials: "GU",
    workspaceId: "ws-inhive",
    role: "viewer",
    onboardingCompleted: false,
    joinDate: new Date().toISOString(),
  };

  const profile: UserProfile = user ? {
    id: user._id || "user-temp",
    name: user.name,
    email: user.email,
    initials: user.name.substring(0, 2).toUpperCase(),
    workspaceId: "ws-inhive",
    role: user.role === 'creator' ? "admin" : "member",
    onboardingCompleted: true,
    joinDate: new Date().toISOString(),
    avatarUrl: user.profile_logo || user.avatar,
  } : fallbackProfile;


  return useQuery<UserProfile>({
    queryKey: ["profile", user?._id],
    queryFn: async () => profile,
    enabled: true,
    initialData: profile,
  });
}

// ─── Workspace ───────────────────────────────────────────────────────────────

export function useWorkspace() {
  const user = useAuthStore((state) => state.user);
  return useQuery<Workspace>({
    queryKey: ["workspace"],
    queryFn: async () => {
      const { data } = await axios.get(`${BASE_URL}/api/users/profile`, getAuthHeaders());
      // The profile endpoint returns the user with workspace details
      return data.workspaceId || MOCK_WORKSPACE;
    },
    enabled: !!user,
    initialData: MOCK_WORKSPACE,
  });
}


// ─── Sprints ─────────────────────────────────────────────────────────────────

export function useSprints() {
  const user = useAuthStore((state) => state.user);
  return useQuery<Sprint[]>({
    queryKey: ["sprints"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/sprints`, getAuthHeaders());
      return data;
    },
    enabled: !!user,
    initialData: [],
  });
}

export function useActiveSprint() {
  const { data: sprints = [] } = useSprints();
  return sprints.find((s) => s.status === "active") ?? sprints[0];
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export function useTasks(sprintId?: string) {
  const user = useAuthStore((state) => state.user);
  return useQuery<Task[]>({
    queryKey: ["tasks", sprintId],
    queryFn: async () => {
      const url = sprintId ? `${API_URL}/tasks?sprintId=${sprintId}` : `${API_URL}/tasks`;
      const { data } = await axios.get(url, getAuthHeaders());
      return data;
    },
    enabled: !!user,
    initialData: [],
  });
}

export function useMyTasks() {
  const user = useAuthStore((state) => state.user);
  return useQuery<Task[]>({
    queryKey: ["tasks", "me"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/tasks?assigneeId=me`, getAuthHeaders());
      return data;
    },
    enabled: !!user,
    initialData: [],
  });
}

// ─── Team Members ─────────────────────────────────────────────────────────────

export function useTeamMembers() {
  const user = useAuthStore((state) => state.user);
  return useQuery<WorkspaceMember[]>({
    queryKey: ["teamMembers"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/team`, getAuthHeaders());
      return data;
    },
    enabled: !!user,
    initialData: [],
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
      const { data } = await axios.post(`${API_URL}/tasks`, task, getAuthHeaders());
      return data;
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
      const { data } = await axios.put(`${API_URL}/tasks/${updates.id}`, updates, getAuthHeaders());
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

// ─── Workspace & Team Mutations ───────────────────────────────────────────────

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { name: string; tagline: string; role: string }) => {
      const { data } = await axios.post(`${API_URL}/workspaces`, args, getAuthHeaders());
      // Re-fetch profile/user to get the updated workspaceId and role
      const userRes = await axios.get(`${BASE_URL}/api/users/profile`, getAuthHeaders());
      useAuthStore.getState().login(userRes.data, useAuthStore.getState().token!);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { email: string; name: string; role: string }) => {
      const { data } = await axios.post(`${API_URL}/team/invite`, args, getAuthHeaders());
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
    },
  });
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; name: string; role: string }) => {
      const { data } = await axios.put(`${API_URL}/team/${args.id}`, args, getAuthHeaders());
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
    },
  });
}

export function useDeleteTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`${API_URL}/team/${id}`, getAuthHeaders());
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] });
    },
  });
}


// ─── Workspace Creator Check ──────────────────────────────────────────────────

export function useIsWorkspaceCreator(_workspaceId: string) {
  const user = useAuthStore((state) => state.user);
  return useQuery<boolean>({
    queryKey: ["isWorkspaceCreator", _workspaceId],
    queryFn: async () => {
      return user?.role === 'creator';
    },
    enabled: !!user,
    initialData: user?.role === 'creator',
  });
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export function useMilestones(workspaceId: string) {
  const user = useAuthStore((state) => state.user);
  return useQuery<Milestone[]>({
    queryKey: ["milestones", workspaceId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/milestones?workspaceId=${workspaceId}`, getAuthHeaders());
      return data;
    },
    enabled: !!workspaceId && !!user,
    initialData: [],
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: CreateMilestoneArgs): Promise<Milestone> => {
      const { data } = await axios.post(`${API_URL}/milestones`, args, getAuthHeaders());
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["milestones", variables.workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
    },
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, workspaceId }: { id: string; workspaceId: string }) => {
      const { data } = await axios.delete(`${API_URL}/milestones/${id}`, getAuthHeaders());
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["milestones", variables.workspaceId],
      });
      queryClient.invalidateQueries({ queryKey: ["sprints"] });
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
      workspaceId,
      sprint,
    }: {
      milestoneId: string;
      workspaceId: string;
      sprint: MilestoneSprintInfo;
    }) => {
      // In a real app we'd POST to add sprint. For now, doing nothing dynamically here
      // since sprints are bundled. But we can trigger a refetch.
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
      // Stub for assigning members
      return { milestoneId, sprintId, assignees, workspaceId };
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["milestones", variables.workspaceId],
      });
    },
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  icon?: string;
  color?: string;
}

export function useNotifications(workspaceId: string) {
  const user = useAuthStore((state) => state.user);
  return useQuery<AppNotification[]>({
    queryKey: ["notifications", workspaceId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/notifications?workspaceId=${workspaceId}`, getAuthHeaders());
      return data;
    },
    enabled: !!user && !!workspaceId,
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workspaceId: string) => {
      const { data } = await axios.put(`${API_URL}/notifications/read-all`, { workspaceId }, getAuthHeaders());
      return data;
    },
    onSuccess: (_data, workspaceId) => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", workspaceId],
      });
    },
  });
}
