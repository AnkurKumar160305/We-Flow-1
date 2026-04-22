import Common "../types/common";
import MTypes "../types/milestone";
import SprintTypes "../types/sprint";
import WTypes "../types/workspace";
import MilestoneLib "../lib/milestone";
import List "mo:core/List";
import Map "mo:core/Map";

mixin (
  milestones : List.List<MTypes.Milestone>,
  sprints : List.List<SprintTypes.Sprint>,
  workspaces : List.List<WTypes.Workspace>,
  inviteLinks : Map.Map<Common.SprintId, Text>,
  nextMilestoneId : [var Nat],
  nextSprintId : [var Nat],
) {
  public shared ({ caller }) func createMilestone(args : MTypes.CreateMilestoneArgs) : async MTypes.MilestonePublic {
    MilestoneLib.createMilestone(milestones, sprints, workspaces, nextMilestoneId, nextSprintId, caller, args);
  };

  public query func getMilestone(milestoneId : Common.MilestoneId) : async ?MTypes.MilestonePublic {
    MilestoneLib.getMilestone(milestones, milestoneId);
  };

  public query func listMilestones(workspaceId : Common.WorkspaceId) : async [MTypes.MilestonePublic] {
    MilestoneLib.listMilestones(milestones, workspaceId);
  };

  public shared ({ caller }) func updateMilestone(milestoneId : Common.MilestoneId, args : MTypes.UpdateMilestoneArgs) : async MTypes.MilestonePublic {
    MilestoneLib.updateMilestone(milestones, workspaces, caller, milestoneId, args);
  };

  public shared ({ caller }) func deleteMilestone(milestoneId : Common.MilestoneId) : async () {
    MilestoneLib.deleteMilestone(milestones, workspaces, caller, milestoneId);
  };

  // Invite link for a sprint — auto-created on first access
  public shared func getSprintInviteLink(sprintId : Common.SprintId) : async Text {
    MilestoneLib.getOrCreateInviteLink(inviteLinks, sprintId, "https://weflow.app");
  };

  public query func getSprintInviteLinkQuery(sprintId : Common.SprintId) : async ?Text {
    MilestoneLib.getInviteLink(inviteLinks, sprintId);
  };
};
