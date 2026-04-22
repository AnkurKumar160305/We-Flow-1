import type { backendInterface, MilestonePublic } from "../backend";
import {
  Column,
  Department,
  MemberRole,
  Priority,
  SprintStatus,
  TaskStatus,
} from "../backend";
import { Principal } from "@icp-sdk/core/principal";

const demoUserId = Principal.fromText("aaaaa-aa");

const workspace = {
  id: BigInt(1),
  name: "InHive",
  tagline: "Building the future of work",
  logoUrl: "",
  ownerId: demoUserId,
  createdAt: BigInt(Date.now()) * BigInt(1_000_000),
};

const sprint = {
  id: BigInt(1),
  workspaceId: BigInt(1),
  name: "Sprint 1",
  startDate: BigInt(1743465600000000000),
  endDate: BigInt(1744588800000000000),
  goal: "Launch MVP core",
  status: SprintStatus.Active,
  createdAt: BigInt(Date.now()) * BigInt(1_000_000),
};

const designBucket = {
  id: BigInt(1),
  workspaceId: BigInt(1),
  name: "Design",
  color: "#7C3AED",
  createdAt: BigInt(Date.now()) * BigInt(1_000_000),
};

const engBucket = {
  id: BigInt(2),
  workspaceId: BigInt(1),
  name: "Engineering",
  color: "#2563EB",
  createdAt: BigInt(Date.now()) * BigInt(1_000_000),
};

const mktBucket = {
  id: BigInt(3),
  workspaceId: BigInt(1),
  name: "Marketing",
  color: "#D97706",
  createdAt: BigInt(Date.now()) * BigInt(1_000_000),
};

const profile = {
  id: demoUserId,
  name: "Alex Johnson",
  title: "Product Manager",
  bio: "Building great products",
  department: "Management",
  avatarUrl: "",
  onboardingComplete: true,
  createdAt: BigInt(Date.now()) * BigInt(1_000_000),
};

const todoTasks = [
  {
    id: BigInt(1),
    workspaceId: BigInt(1),
    title: "Design onboarding screens",
    description: "",
    columnId: Column.Todo,
    sprintId: BigInt(1),
    assigneeId: demoUserId,
    department: Department.Design,
    dueDate: BigInt(1744416000000000000),
    priority: Priority.Medium,
    status: TaskStatus.Open,
    order: BigInt(1),
    blockerReason: "",
    bucketId: BigInt(1),
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  },
  {
    id: BigInt(2),
    workspaceId: BigInt(1),
    title: "Set up Supabase schema",
    description: "",
    columnId: Column.Todo,
    sprintId: BigInt(1),
    assigneeId: demoUserId,
    department: Department.Engineering,
    dueDate: BigInt(1744243200000000000),
    priority: Priority.Medium,
    status: TaskStatus.Open,
    order: BigInt(2),
    blockerReason: "",
    bucketId: BigInt(2),
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  },
  {
    id: BigInt(3),
    workspaceId: BigInt(1),
    title: "Write launch blog post",
    description: "",
    columnId: Column.Todo,
    sprintId: BigInt(1),
    assigneeId: demoUserId,
    department: Department.Marketing,
    dueDate: BigInt(1744588800000000000),
    priority: Priority.Low,
    status: TaskStatus.Open,
    order: BigInt(3),
    blockerReason: "",
    bucketId: BigInt(3),
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  },
];

const doingTasks = [
  {
    id: BigInt(4),
    workspaceId: BigInt(1),
    title: "Build Kanban board",
    description: "",
    columnId: Column.Doing,
    sprintId: BigInt(1),
    assigneeId: demoUserId,
    department: Department.Engineering,
    dueDate: BigInt(1744156800000000000),
    priority: Priority.High,
    status: TaskStatus.InProgress,
    order: BigInt(4),
    blockerReason: "",
    bucketId: BigInt(2),
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  },
  {
    id: BigInt(5),
    workspaceId: BigInt(1),
    title: "Create brand identity",
    description: "",
    columnId: Column.Doing,
    sprintId: BigInt(1),
    assigneeId: demoUserId,
    department: Department.Design,
    dueDate: BigInt(1744070400000000000),
    priority: Priority.Medium,
    status: TaskStatus.InProgress,
    order: BigInt(5),
    blockerReason: "",
    bucketId: BigInt(1),
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  },
];

const doneTasks = [
  {
    id: BigInt(6),
    workspaceId: BigInt(1),
    title: "Netlify deployment pipeline",
    description: "",
    columnId: Column.Done,
    sprintId: BigInt(1),
    assigneeId: demoUserId,
    department: Department.Engineering,
    dueDate: BigInt(1743811200000000000),
    priority: Priority.High,
    status: TaskStatus.Completed,
    order: BigInt(6),
    blockerReason: "",
    bucketId: BigInt(2),
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  },
  {
    id: BigInt(7),
    workspaceId: BigInt(1),
    title: "Competitor analysis report",
    description: "",
    columnId: Column.Done,
    sprintId: BigInt(1),
    assigneeId: demoUserId,
    department: Department.Marketing,
    dueDate: BigInt(1743638400000000000),
    priority: Priority.Low,
    status: TaskStatus.Completed,
    order: BigInt(7),
    blockerReason: "",
    bucketId: BigInt(3),
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  },
];

const blockedTasks = [
  {
    id: BigInt(8),
    workspaceId: BigInt(1),
    title: "API rate limiting",
    description: "",
    columnId: Column.Blocked,
    sprintId: BigInt(1),
    assigneeId: demoUserId,
    department: Department.Engineering,
    dueDate: BigInt(1744243200000000000),
    priority: Priority.High,
    status: TaskStatus.Blocked,
    order: BigInt(8),
    blockerReason: "Waiting for infrastructure access credentials from DevOps",
    bucketId: BigInt(2),
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  },
];

export const mockBackend: backendInterface = {
  completeOnboarding: async () => undefined,
  createBucket: async () => designBucket,
  createOrUpdateProfile: async () => profile,
  createSprint: async () => sprint,
  createTask: async () => todoTasks[0],
  createWorkspace: async () => workspace,
  deleteBucket: async () => undefined,
  deleteSprint: async () => undefined,
  deleteTask: async () => undefined,
  getActiveSprint: async () => sprint,
  getBucket: async () => designBucket,
  getMyProfile: async () => profile,
  getMyWorkspaces: async () => [workspace],
  getProfile: async () => profile,
  getSprint: async () => sprint,
  getTask: async () => todoTasks[0],
  getWorkspace: async () => workspace,
  initSampleData: async () => undefined,
  inviteMember: async () => undefined,
  listBuckets: async () => [designBucket, engBucket, mktBucket],
  listMembers: async () => [
    { userId: demoUserId, joinedAt: BigInt(Date.now()) * BigInt(1_000_000), role: MemberRole.Admin },
  ],
  listSprints: async () => [sprint],
  listTasksByAssignee: async () => [...todoTasks, ...doingTasks, ...doneTasks, ...blockedTasks],
  listTasksByColumn: async (_, column) => {
    if (column === Column.Todo) return todoTasks;
    if (column === Column.Doing) return doingTasks;
    if (column === Column.Done) return doneTasks;
    if (column === Column.Blocked) return blockedTasks;
    return [];
  },
  listTasksBySprint: async () => [...todoTasks, ...doingTasks, ...doneTasks, ...blockedTasks],
  moveTask: async () => todoTasks[0],
  registerProfile: async () => profile,
  removeMember: async () => undefined,
  setSprintStatus: async () => sprint,
  updateBucket: async () => designBucket,
  updateMemberRole: async () => undefined,
  updateSprint: async () => sprint,
  updateTask: async () => todoTasks[0],
  createMilestone: async (args) => ({
    id: BigInt(1),
    workspaceId: args.workspaceId,
    name: args.name,
    startDate: args.startDate,
    endDate: args.endDate,
    createdBy: demoUserId,
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  } satisfies MilestonePublic),
  deleteMilestone: async () => undefined,
  getMilestone: async () => ({
    id: BigInt(1),
    workspaceId: BigInt(1),
    name: "Mock Milestone",
    startDate: BigInt(Date.now()) * BigInt(1_000_000),
    endDate: BigInt(Date.now()) * BigInt(1_000_000),
    createdBy: demoUserId,
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  } satisfies MilestonePublic),
  getSprintInviteLink: async (sprintId) =>
    `https://weflow.app/invite/${sprintId.toString()}`,
  getSprintInviteLinkQuery: async (sprintId) =>
    `https://weflow.app/invite/${sprintId.toString()}`,
  getWorkspaceOwner: async () => demoUserId,
  isWorkspaceCreator: async () => true,
  listMilestones: async () => [] as MilestonePublic[],
  updateMilestone: async (_, args) => ({
    id: BigInt(1),
    workspaceId: BigInt(1),
    name: args.name,
    startDate: args.startDate,
    endDate: args.endDate,
    createdBy: demoUserId,
    createdAt: BigInt(Date.now()) * BigInt(1_000_000),
  } satisfies MilestonePublic),
};
