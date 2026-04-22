import Common "../types/common";
import MTypes "../types/milestone";
import WTypes "../types/workspace";
import SprintTypes "../types/sprint";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

module {
  // 1 day in nanoseconds
  let DAY_NS : Int = 86_400_000_000_000;

  public func toPublic(m : MTypes.Milestone) : MTypes.MilestonePublic {
    {
      id = m.id;
      workspaceId = m.workspaceId;
      name = m.name;
      startDate = m.startDate;
      endDate = m.endDate;
      createdBy = m.createdBy;
      createdAt = m.createdAt;
    };
  };

  func isWorkspaceOwner(
    workspaces : List.List<WTypes.Workspace>,
    workspaceId : Common.WorkspaceId,
    caller : Common.UserId,
  ) : Bool {
    func matchId(w : WTypes.Workspace) : Bool { w.id == workspaceId };
    switch (workspaces.find(matchId)) {
      case (?ws) { Principal.equal(ws.ownerId, caller) };
      case null { false };
    };
  };

  // Auto-generate sprints from template starting at startDate
  func buildSprints(
    sprints : List.List<SprintTypes.Sprint>,
    nextSprintId : [var Nat],
    workspaceId : Common.WorkspaceId,
    _milestoneId : Common.MilestoneId,
    milestoneName : Text,
    startDate : Common.Timestamp,
    template : MTypes.SprintTemplate,
  ) {
    let configs : [(Text, Int, Int)] = switch (template) {
      // (name, offsetDays, durationDays)
      case (#TwoSprints) {
        [
          ("Sprint 1", 0, 15),
          ("Sprint 2", 15, 15),
        ]
      };
      case (#FourSprints) {
        [
          ("Sprint 1", 0, 7),
          ("Sprint 2", 7, 7),
          ("Sprint 3", 14, 7),
          ("Sprint 4", 21, 7),
        ]
      };
    };

    for ((sprintName, offsetDays, durationDays) in configs.values()) {
      let sprintStart : Int = startDate + offsetDays * DAY_NS;
      let sprintEnd : Int = sprintStart + durationDays * DAY_NS;
      let sid = nextSprintId[0];
      nextSprintId[0] += 1;
      let sprint : SprintTypes.Sprint = {
        id = sid;
        workspaceId = workspaceId;
        var name = milestoneName # " – " # sprintName;
        var startDate = sprintStart;
        var endDate = sprintEnd;
        var goal = "";
        var status = #Planned;
        createdAt = Time.now();
      };
      sprints.add(sprint);
    };
  };

  public func createMilestone(
    milestones : List.List<MTypes.Milestone>,
    sprints : List.List<SprintTypes.Sprint>,
    workspaces : List.List<WTypes.Workspace>,
    nextMilestoneId : [var Nat],
    nextSprintId : [var Nat],
    caller : Common.UserId,
    args : MTypes.CreateMilestoneArgs,
  ) : MTypes.MilestonePublic {
    if (not isWorkspaceOwner(workspaces, args.workspaceId, caller)) {
      Runtime.trap("Unauthorized: only the workspace creator can create milestones");
    };
    let mid = nextMilestoneId[0];
    nextMilestoneId[0] += 1;
    let milestone : MTypes.Milestone = {
      id = mid;
      workspaceId = args.workspaceId;
      var name = args.name;
      var startDate = args.startDate;
      var endDate = args.endDate;
      createdBy = caller;
      createdAt = Time.now();
    };
    milestones.add(milestone);
    buildSprints(sprints, nextSprintId, args.workspaceId, mid, args.name, args.startDate, args.template);
    toPublic(milestone);
  };

  public func getMilestone(
    milestones : List.List<MTypes.Milestone>,
    milestoneId : Common.MilestoneId,
  ) : ?MTypes.MilestonePublic {
    func matchId(m : MTypes.Milestone) : Bool { m.id == milestoneId };
    switch (milestones.find(matchId)) {
      case (?m) { ?toPublic(m) };
      case null { null };
    };
  };

  public func listMilestones(
    milestones : List.List<MTypes.Milestone>,
    workspaceId : Common.WorkspaceId,
  ) : [MTypes.MilestonePublic] {
    func matchWs(m : MTypes.Milestone) : Bool { m.workspaceId == workspaceId };
    milestones.filter(matchWs)
      .map<MTypes.Milestone, MTypes.MilestonePublic>(func(m) { toPublic(m) })
      .toArray();
  };

  public func updateMilestone(
    milestones : List.List<MTypes.Milestone>,
    workspaces : List.List<WTypes.Workspace>,
    caller : Common.UserId,
    milestoneId : Common.MilestoneId,
    args : MTypes.UpdateMilestoneArgs,
  ) : MTypes.MilestonePublic {
    func matchId(m : MTypes.Milestone) : Bool { m.id == milestoneId };
    let milestone = switch (milestones.find(matchId)) {
      case (?m) { m };
      case null { Runtime.trap("Milestone not found") };
    };
    if (not isWorkspaceOwner(workspaces, milestone.workspaceId, caller)) {
      Runtime.trap("Unauthorized: only the workspace creator can update milestones");
    };
    milestone.name := args.name;
    milestone.startDate := args.startDate;
    milestone.endDate := args.endDate;
    toPublic(milestone);
  };

  public func deleteMilestone(
    milestones : List.List<MTypes.Milestone>,
    workspaces : List.List<WTypes.Workspace>,
    caller : Common.UserId,
    milestoneId : Common.MilestoneId,
  ) : () {
    func matchId(m : MTypes.Milestone) : Bool { m.id == milestoneId };
    func notMatchId(m : MTypes.Milestone) : Bool { m.id != milestoneId };
    let milestone = switch (milestones.find(matchId)) {
      case (?m) { m };
      case null { Runtime.trap("Milestone not found") };
    };
    if (not isWorkspaceOwner(workspaces, milestone.workspaceId, caller)) {
      Runtime.trap("Unauthorized: only the workspace creator can delete milestones");
    };
    let filtered = milestones.filter(notMatchId);
    milestones.clear();
    milestones.append(filtered);
  };

  // --- Invite link helpers (token per sprint stored externally in main) ---
  public func getOrCreateInviteLink(
    inviteLinks : Map.Map<Common.SprintId, Text>,
    sprintId : Common.SprintId,
    baseUrl : Text,
  ) : Text {
    switch (inviteLinks.get(sprintId)) {
      case (?link) { link };
      case null {
        let token = "sprint-" # sprintId.toText() # "-" # (Time.now()).toText();
        let link = baseUrl # "/invite/" # token;
        inviteLinks.add(sprintId, link);
        link;
      };
    };
  };

  public func getInviteLink(
    inviteLinks : Map.Map<Common.SprintId, Text>,
    sprintId : Common.SprintId,
  ) : ?Text {
    inviteLinks.get(sprintId);
  };
};
