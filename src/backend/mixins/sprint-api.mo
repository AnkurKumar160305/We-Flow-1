import Common "../types/common";
import SprintTypes "../types/sprint";
import WTypes "../types/workspace";
import SprintLib "../lib/sprint";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

mixin (
  sprints : List.List<SprintTypes.Sprint>,
  workspaceMembers : Map.Map<Common.WorkspaceId, List.List<WTypes.WorkspaceMember>>,
  nextSprintId : [var Nat],
) {
  public shared ({ caller }) func createSprint(args : SprintTypes.CreateSprintArgs) : async SprintTypes.SprintPublic {
    let sprint = SprintLib.createSprint(sprints, workspaceMembers, nextSprintId[0], caller, args);
    nextSprintId[0] += 1;
    sprint;
  };

  public query func getSprint(sprintId : Common.SprintId) : async ?SprintTypes.SprintPublic {
    SprintLib.getSprint(sprints, sprintId);
  };

  public query func listSprints(workspaceId : Common.WorkspaceId) : async [SprintTypes.SprintPublic] {
    SprintLib.listSprints(sprints, workspaceId);
  };

  public query func getActiveSprint(workspaceId : Common.WorkspaceId) : async ?SprintTypes.SprintPublic {
    SprintLib.getActiveSprint(sprints, workspaceId);
  };

  public shared ({ caller }) func updateSprint(sprintId : Common.SprintId, args : SprintTypes.UpdateSprintArgs) : async SprintTypes.SprintPublic {
    SprintLib.updateSprint(sprints, workspaceMembers, caller, sprintId, args);
  };

  public shared ({ caller }) func deleteSprint(sprintId : Common.SprintId) : async () {
    SprintLib.deleteSprint(sprints, workspaceMembers, caller, sprintId);
  };

  public shared ({ caller }) func setSprintStatus(sprintId : Common.SprintId, status : SprintTypes.SprintStatus) : async SprintTypes.SprintPublic {
    func matchId(s : SprintTypes.Sprint) : Bool { s.id == sprintId };
    let sprint = switch (sprints.find(matchId)) {
      case (?s) { s };
      case null { Runtime.trap("Sprint not found") };
    };
    sprint.status := status;
    SprintLib.toPublic(sprint);
  };
};
