import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CreateSprintArgs {
    endDate: Timestamp;
    goal: string;
    name: string;
    workspaceId: WorkspaceId;
    startDate: Timestamp;
}
export type Timestamp = bigint;
export interface SprintPublic {
    id: SprintId;
    status: SprintStatus;
    endDate: Timestamp;
    goal: string;
    name: string;
    createdAt: Timestamp;
    workspaceId: WorkspaceId;
    startDate: Timestamp;
}
export type SprintId = bigint;
export interface UpdateSprintArgs {
    status: SprintStatus;
    endDate: Timestamp;
    goal: string;
    name: string;
    startDate: Timestamp;
}
export interface UpdateProfileArgs {
    bio: string;
    title: string;
    name: string;
    onboardingComplete: boolean;
    avatarUrl: string;
    department: string;
}
export interface UpdateTaskArgs {
    status: TaskStatus;
    title: string;
    blockerReason: string;
    assigneeId?: UserId;
    order: bigint;
    sprintId?: SprintId;
    dueDate?: Timestamp;
    bucketId?: BucketId;
    description: string;
    priority: Priority;
    department?: Department;
    columnId: Column;
}
export interface UpdateBucketArgs {
    name: string;
    color: string;
}
export interface CreateBucketArgs {
    name: string;
    color: string;
    workspaceId: WorkspaceId;
}
export interface TaskPublic {
    id: TaskId;
    status: TaskStatus;
    title: string;
    blockerReason: string;
    assigneeId?: UserId;
    order: bigint;
    sprintId?: SprintId;
    createdAt: Timestamp;
    dueDate?: Timestamp;
    bucketId?: BucketId;
    description: string;
    workspaceId: WorkspaceId;
    priority: Priority;
    department?: Department;
    columnId: Column;
}
export interface CreateWorkspaceArgs {
    tagline: string;
    name: string;
    logoUrl: string;
}
export interface CreateMilestoneArgs {
    endDate: Timestamp;
    name: string;
    template: SprintTemplate;
    workspaceId: WorkspaceId;
    startDate: Timestamp;
}
export type WorkspaceId = bigint;
export interface MoveTaskArgs {
    blockerReason: string;
    newOrder: bigint;
    newColumn: Column;
    taskId: TaskId;
}
export type BucketId = bigint;
export interface UpdateMilestoneArgs {
    endDate: Timestamp;
    name: string;
    startDate: Timestamp;
}
export interface WorkspaceMember {
    userId: UserId;
    joinedAt: Timestamp;
    role: MemberRole;
}
export interface Workspace {
    id: WorkspaceId;
    ownerId: UserId;
    tagline: string;
    name: string;
    createdAt: Timestamp;
    logoUrl: string;
}
export interface TaskBucketPublic {
    id: BucketId;
    name: string;
    createdAt: Timestamp;
    color: string;
    workspaceId: WorkspaceId;
}
export interface UserProfilePublic {
    id: UserId;
    bio: string;
    title: string;
    name: string;
    createdAt: Timestamp;
    onboardingComplete: boolean;
    avatarUrl: string;
    department: string;
}
export interface CreateTaskArgs {
    title: string;
    assigneeId?: UserId;
    order: bigint;
    sprintId?: SprintId;
    dueDate?: Timestamp;
    bucketId?: BucketId;
    description: string;
    workspaceId: WorkspaceId;
    priority: Priority;
    department?: Department;
    columnId: Column;
}
export type UserId = Principal;
export type MilestoneId = bigint;
export type TaskId = bigint;
export interface MilestonePublic {
    id: MilestoneId;
    endDate: Timestamp;
    name: string;
    createdAt: Timestamp;
    createdBy: UserId;
    workspaceId: WorkspaceId;
    startDate: Timestamp;
}
export enum Column {
    Blocked = "Blocked",
    Done = "Done",
    Todo = "Todo",
    Doing = "Doing"
}
export enum Department {
    Engineering = "Engineering",
    Operations = "Operations",
    Design = "Design",
    Management = "Management",
    Marketing = "Marketing"
}
export enum MemberRole {
    Lead = "Lead",
    Member = "Member",
    Admin = "Admin",
    CoCreator = "CoCreator"
}
export enum Priority {
    Low = "Low",
    High = "High",
    Medium = "Medium",
    Critical = "Critical"
}
export enum SprintStatus {
    Active = "Active",
    Planned = "Planned",
    Completed = "Completed"
}
export enum SprintTemplate {
    TwoSprints = "TwoSprints",
    FourSprints = "FourSprints"
}
export enum TaskStatus {
    Blocked = "Blocked",
    Open = "Open",
    InProgress = "InProgress",
    Completed = "Completed"
}
export interface backendInterface {
    completeOnboarding(): Promise<void>;
    createBucket(args: CreateBucketArgs): Promise<TaskBucketPublic>;
    createMilestone(args: CreateMilestoneArgs): Promise<MilestonePublic>;
    createOrUpdateProfile(args: UpdateProfileArgs): Promise<UserProfilePublic>;
    createSprint(args: CreateSprintArgs): Promise<SprintPublic>;
    createTask(args: CreateTaskArgs): Promise<TaskPublic>;
    createWorkspace(args: CreateWorkspaceArgs): Promise<Workspace>;
    deleteBucket(bucketId: BucketId): Promise<void>;
    deleteMilestone(milestoneId: MilestoneId): Promise<void>;
    deleteSprint(sprintId: SprintId): Promise<void>;
    deleteTask(taskId: TaskId): Promise<void>;
    getActiveSprint(workspaceId: WorkspaceId): Promise<SprintPublic | null>;
    getBucket(bucketId: BucketId): Promise<TaskBucketPublic | null>;
    getMilestone(milestoneId: MilestoneId): Promise<MilestonePublic | null>;
    getMyProfile(): Promise<UserProfilePublic | null>;
    getMyWorkspaces(): Promise<Array<Workspace>>;
    getProfile(userId: UserId): Promise<UserProfilePublic | null>;
    getSprint(sprintId: SprintId): Promise<SprintPublic | null>;
    getSprintInviteLink(sprintId: SprintId): Promise<string>;
    getSprintInviteLinkQuery(sprintId: SprintId): Promise<string | null>;
    getTask(taskId: TaskId): Promise<TaskPublic | null>;
    getWorkspace(workspaceId: WorkspaceId): Promise<Workspace | null>;
    getWorkspaceOwner(workspaceId: WorkspaceId): Promise<UserId | null>;
    initSampleData(): Promise<void>;
    inviteMember(workspaceId: WorkspaceId, userId: UserId, role: MemberRole): Promise<void>;
    isWorkspaceCreator(workspaceId: WorkspaceId): Promise<boolean>;
    listBuckets(workspaceId: WorkspaceId): Promise<Array<TaskBucketPublic>>;
    listMembers(workspaceId: WorkspaceId): Promise<Array<WorkspaceMember>>;
    listMilestones(workspaceId: WorkspaceId): Promise<Array<MilestonePublic>>;
    listSprints(workspaceId: WorkspaceId): Promise<Array<SprintPublic>>;
    listTasksByAssignee(workspaceId: WorkspaceId, assigneeId: UserId): Promise<Array<TaskPublic>>;
    listTasksByColumn(workspaceId: WorkspaceId, column: Column): Promise<Array<TaskPublic>>;
    listTasksBySprint(workspaceId: WorkspaceId, sprintId: SprintId): Promise<Array<TaskPublic>>;
    moveTask(args: MoveTaskArgs): Promise<TaskPublic>;
    registerProfile(): Promise<UserProfilePublic>;
    removeMember(workspaceId: WorkspaceId, userId: UserId): Promise<void>;
    setSprintStatus(sprintId: SprintId, status: SprintStatus): Promise<SprintPublic>;
    updateBucket(bucketId: BucketId, args: UpdateBucketArgs): Promise<TaskBucketPublic>;
    updateMemberRole(workspaceId: WorkspaceId, userId: UserId, newRole: MemberRole): Promise<void>;
    updateMilestone(milestoneId: MilestoneId, args: UpdateMilestoneArgs): Promise<MilestonePublic>;
    updateSprint(sprintId: SprintId, args: UpdateSprintArgs): Promise<SprintPublic>;
    updateTask(taskId: TaskId, args: UpdateTaskArgs): Promise<TaskPublic>;
}
