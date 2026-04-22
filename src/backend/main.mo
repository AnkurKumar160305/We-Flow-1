import Common "types/common";
import WTypes "types/workspace";
import SprintTypes "types/sprint";
import TaskTypes "types/task";
import BucketTypes "types/bucket";
import MTypes "types/milestone";
import WorkspaceApi "mixins/workspace-api";
import SprintApi "mixins/sprint-api";
import TaskApi "mixins/task-api";
import BucketApi "mixins/bucket-api";
import MilestoneApi "mixins/milestone-api";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

actor {
  // User profiles
  let profiles = Map.empty<Common.UserId, WTypes.UserProfile>();

  // Workspaces
  let workspaces = List.empty<WTypes.Workspace>();
  let workspaceMembers = Map.empty<Common.WorkspaceId, List.List<WTypes.WorkspaceMember>>();
  let nextWorkspaceId : [var Nat] = [var 1];

  // Sprints
  let sprints = List.empty<SprintTypes.Sprint>();
  let nextSprintId : [var Nat] = [var 1];

  // Tasks
  let tasks = List.empty<TaskTypes.Task>();
  let nextTaskId : [var Nat] = [var 1];

  // Buckets
  let buckets = List.empty<BucketTypes.TaskBucket>();
  let nextBucketId : [var Nat] = [var 1];

  // Milestones
  let milestones = List.empty<MTypes.Milestone>();
  let nextMilestoneId : [var Nat] = [var 1];

  // Sprint invite links: sprintId -> invite URL
  let inviteLinks = Map.empty<Common.SprintId, Text>();

  // Sample data flag
  var sampleDataInitialized : Bool = false;

  include WorkspaceApi(profiles, workspaces, workspaceMembers, nextWorkspaceId);
  include SprintApi(sprints, workspaceMembers, nextSprintId);
  include TaskApi(tasks, workspaceMembers, nextTaskId);
  include BucketApi(buckets, workspaceMembers, nextBucketId);
  include MilestoneApi(milestones, sprints, workspaces, inviteLinks, nextMilestoneId, nextSprintId);

  // Initialize sample data for demo — idempotent
  public func initSampleData() : async () {
    if (sampleDataInitialized) { return };
    sampleDataInitialized := true;

    // Create a demo user principal (anonymous-like placeholder)
    let demoUserId = Principal.fromText("aaaaa-aa");

    // Create sample workspace: InHive
    let wsId = nextWorkspaceId[0];
    nextWorkspaceId[0] += 1;
    let workspace : WTypes.Workspace = {
      id = wsId;
      name = "InHive";
      tagline = "Building the future of work";
      logoUrl = "";
      ownerId = demoUserId;
      createdAt = Time.now();
    };
    workspaces.add(workspace);

    // Add demo user as admin
    let memberList = List.empty<WTypes.WorkspaceMember>();
    memberList.add({
      userId = demoUserId;
      role = #Admin;
      joinedAt = Time.now();
    });
    workspaceMembers.add(wsId, memberList);

    // Create sample profile
    let demoProfile : WTypes.UserProfile = {
      id = demoUserId;
      var name = "Alex Johnson";
      var title = "Product Manager";
      var bio = "Building great products";
      var department = "Management";
      var avatarUrl = "";
      var onboardingComplete = true;
      createdAt = Time.now();
    };
    profiles.add(demoUserId, demoProfile);

    // Create sample task buckets
    let designBucketId = nextBucketId[0];
    nextBucketId[0] += 1;
    buckets.add({
      id = designBucketId;
      workspaceId = wsId;
      var name = "Design";
      var color = "#7C3AED";
      createdAt = Time.now();
    });

    let engBucketId = nextBucketId[0];
    nextBucketId[0] += 1;
    buckets.add({
      id = engBucketId;
      workspaceId = wsId;
      var name = "Engineering";
      var color = "#2563EB";
      createdAt = Time.now();
    });

    let mktBucketId = nextBucketId[0];
    nextBucketId[0] += 1;
    buckets.add({
      id = mktBucketId;
      workspaceId = wsId;
      var name = "Marketing";
      var color = "#D97706";
      createdAt = Time.now();
    });

    // Create sample milestone: Q2 Launch (30-day, 2-sprint template)
    let sampleMilestoneStartNs : Int = 1743465600000000000; // Apr 1 2025
    let sampleMilestoneEndNs : Int = sampleMilestoneStartNs + 30 * 86_400_000_000_000;
    let mid = nextMilestoneId[0];
    nextMilestoneId[0] += 1;
    let sampleMilestone : MTypes.Milestone = {
      id = mid;
      workspaceId = wsId;
      var name = "Q2 Launch";
      var startDate = sampleMilestoneStartNs;
      var endDate = sampleMilestoneEndNs;
      createdBy = demoUserId;
      createdAt = Time.now();
    };
    milestones.add(sampleMilestone);

    // Create Sprint 1: Apr 1-16 (Active)
    let sampleSprintId = nextSprintId[0];
    nextSprintId[0] += 1;
    let sampleSprint : SprintTypes.Sprint = {
      id = sampleSprintId;
      workspaceId = wsId;
      var name = "Q2 Launch – Sprint 1";
      var startDate = 1743465600000000000; // Apr 1 2025
      var endDate = 1744761600000000000;   // Apr 16 2025 (15 days)
      var goal = "Launch MVP core";
      var status = #Active;
      createdAt = Time.now();
    };
    sprints.add(sampleSprint);

    // Create Sprint 2: Apr 16-30 (Planned)
    let sprint2Id = nextSprintId[0];
    nextSprintId[0] += 1;
    let sprint2 : SprintTypes.Sprint = {
      id = sprint2Id;
      workspaceId = wsId;
      var name = "Q2 Launch – Sprint 2";
      var startDate = 1744761600000000000; // Apr 16 2025
      var endDate = 1745971200000000000;   // May 1 2025 (15 days)
      var goal = "Polish and release";
      var status = #Planned;
      createdAt = Time.now();
    };
    sprints.add(sprint2);

    // Helper to add a task
    func addTask(
      taskTitle : Text,
      dept : TaskTypes.Department,
      col : TaskTypes.Column,
      dueNs : Int,
      taskBucketId : Common.BucketId,
      blocker : Text,
    ) {
      let tid = nextTaskId[0];
      nextTaskId[0] += 1;
      tasks.add({
        id = tid;
        workspaceId = wsId;
        var title = taskTitle;
        var description = "";
        var columnId = col;
        var sprintId = ?sampleSprintId;
        var assigneeId = ?demoUserId;
        var department = ?dept;
        var dueDate = ?dueNs;
        var priority : TaskTypes.Priority = #Medium;
        var status = switch (col) {
          case (#Todo) { #Open };
          case (#Doing) { #InProgress };
          case (#Done) { #Completed };
          case (#Blocked) { #Blocked };
        };
        var order = tid;
        var blockerReason = blocker;
        var bucketId = ?taskBucketId;
        createdAt = Time.now();
      });
    };

    addTask("Design onboarding screens", #Design, #Todo, 1744416000000000000, designBucketId, "");
    addTask("Set up Supabase schema", #Engineering, #Todo, 1744243200000000000, engBucketId, "");
    addTask("Write launch blog post", #Marketing, #Todo, 1744588800000000000, mktBucketId, "");
    addTask("Build Kanban board", #Engineering, #Doing, 1744156800000000000, engBucketId, "");
    addTask("Create brand identity", #Design, #Doing, 1744070400000000000, designBucketId, "");
    addTask("Netlify deployment pipeline", #Engineering, #Done, 1743811200000000000, engBucketId, "");
    addTask("Competitor analysis report", #Marketing, #Done, 1743638400000000000, mktBucketId, "");
    addTask("API rate limiting", #Engineering, #Blocked, 1744243200000000000, engBucketId, "Waiting for infrastructure access credentials from DevOps");
  };
};
