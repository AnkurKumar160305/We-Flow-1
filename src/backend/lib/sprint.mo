import Common "../types/common";
import Types "../types/sprint";
import WTypes "../types/workspace";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

module {
  public func toPublic(sprint : Types.Sprint) : Types.SprintPublic {
    {
      id = sprint.id;
      workspaceId = sprint.workspaceId;
      name = sprint.name;
      startDate = sprint.startDate;
      endDate = sprint.endDate;
      goal = sprint.goal;
      status = sprint.status;
      createdAt = sprint.createdAt;
    };
  };

  func isMember(
    members : Map.Map<Common.WorkspaceId, List.List<WTypes.WorkspaceMember>>,
    workspaceId : Common.WorkspaceId,
    userId : Common.UserId,
  ) : Bool {
    switch (members.get(workspaceId)) {
      case (?ml) {
        func matchUser(m : WTypes.WorkspaceMember) : Bool {
          Principal.equal(m.userId, userId)
        };
        ml.find(matchUser) != null
      };
      case null { false };
    };
  };

  public func createSprint(
    sprints : List.List<Types.Sprint>,
    members : Map.Map<Common.WorkspaceId, List.List<WTypes.WorkspaceMember>>,
    nextId : Nat,
    caller : Common.UserId,
    args : Types.CreateSprintArgs,
  ) : Types.SprintPublic {
    if (not isMember(members, args.workspaceId, caller)) {
      Runtime.trap("Unauthorized: not a workspace member");
    };
    let sprint : Types.Sprint = {
      id = nextId;
      workspaceId = args.workspaceId;
      var name = args.name;
      var startDate = args.startDate;
      var endDate = args.endDate;
      var goal = args.goal;
      var status = #Planned;
      createdAt = Time.now();
    };
    sprints.add(sprint);
    toPublic(sprint);
  };

  public func getSprint(
    sprints : List.List<Types.Sprint>,
    sprintId : Common.SprintId,
  ) : ?Types.SprintPublic {
    func matchId(s : Types.Sprint) : Bool { s.id == sprintId };
    switch (sprints.find(matchId)) {
      case (?s) { ?toPublic(s) };
      case null { null };
    };
  };

  public func listSprints(
    sprints : List.List<Types.Sprint>,
    workspaceId : Common.WorkspaceId,
  ) : [Types.SprintPublic] {
    func matchWs(s : Types.Sprint) : Bool { s.workspaceId == workspaceId };
    sprints.filter(matchWs)
      .map<Types.Sprint, Types.SprintPublic>(func(s) { toPublic(s) })
      .toArray();
  };

  public func getActiveSprint(
    sprints : List.List<Types.Sprint>,
    workspaceId : Common.WorkspaceId,
  ) : ?Types.SprintPublic {
    func matchActive(s : Types.Sprint) : Bool {
      s.workspaceId == workspaceId and s.status == #Active
    };
    switch (sprints.find(matchActive)) {
      case (?s) { ?toPublic(s) };
      case null { null };
    };
  };

  public func updateSprint(
    sprints : List.List<Types.Sprint>,
    members : Map.Map<Common.WorkspaceId, List.List<WTypes.WorkspaceMember>>,
    caller : Common.UserId,
    sprintId : Common.SprintId,
    args : Types.UpdateSprintArgs,
  ) : Types.SprintPublic {
    func matchId(s : Types.Sprint) : Bool { s.id == sprintId };
    let sprint = switch (sprints.find(matchId)) {
      case (?s) { s };
      case null { Runtime.trap("Sprint not found") };
    };
    if (not isMember(members, sprint.workspaceId, caller)) {
      Runtime.trap("Unauthorized: not a workspace member");
    };
    sprint.name := args.name;
    sprint.startDate := args.startDate;
    sprint.endDate := args.endDate;
    sprint.goal := args.goal;
    sprint.status := args.status;
    toPublic(sprint);
  };

  public func deleteSprint(
    sprints : List.List<Types.Sprint>,
    members : Map.Map<Common.WorkspaceId, List.List<WTypes.WorkspaceMember>>,
    caller : Common.UserId,
    sprintId : Common.SprintId,
  ) : () {
    func matchId(s : Types.Sprint) : Bool { s.id == sprintId };
    func notMatchId(s : Types.Sprint) : Bool { s.id != sprintId };
    let sprint = switch (sprints.find(matchId)) {
      case (?s) { s };
      case null { Runtime.trap("Sprint not found") };
    };
    if (not isMember(members, sprint.workspaceId, caller)) {
      Runtime.trap("Unauthorized: not a workspace member");
    };
    let filtered = sprints.filter(notMatchId);
    sprints.clear();
    sprints.append(filtered);
  };
};
