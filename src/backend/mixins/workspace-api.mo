import Common "../types/common";
import Types "../types/workspace";
import WorkspaceLib "../lib/workspace";
import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";

mixin (
  profiles : Map.Map<Common.UserId, Types.UserProfile>,
  workspaces : List.List<Types.Workspace>,
  workspaceMembers : Map.Map<Common.WorkspaceId, List.List<Types.WorkspaceMember>>,
  nextWorkspaceId : [var Nat],
) {
  public shared ({ caller }) func getMyProfile() : async ?Types.UserProfilePublic {
    WorkspaceLib.getProfile(profiles, caller);
  };

  public shared ({ caller }) func createOrUpdateProfile(args : Types.UpdateProfileArgs) : async Types.UserProfilePublic {
    WorkspaceLib.updateProfile(profiles, caller, args);
  };

  public query func getProfile(userId : Common.UserId) : async ?Types.UserProfilePublic {
    WorkspaceLib.getProfile(profiles, userId);
  };

  public shared ({ caller }) func registerProfile() : async Types.UserProfilePublic {
    WorkspaceLib.createProfile(profiles, caller);
  };

  public shared ({ caller }) func completeOnboarding() : async () {
    WorkspaceLib.completeOnboarding(profiles, caller);
  };

  public shared ({ caller }) func createWorkspace(args : Types.CreateWorkspaceArgs) : async Types.Workspace {
    let ws = WorkspaceLib.createWorkspace(workspaces, workspaceMembers, nextWorkspaceId[0], caller, args);
    nextWorkspaceId[0] += 1;
    ws;
  };

  public query ({ caller }) func getMyWorkspaces() : async [Types.Workspace] {
    WorkspaceLib.getUserWorkspaces(workspaces, workspaceMembers, caller);
  };

  public query func getWorkspace(workspaceId : Common.WorkspaceId) : async ?Types.Workspace {
    WorkspaceLib.getWorkspace(workspaces, workspaceId);
  };

  public shared ({ caller }) func inviteMember(workspaceId : Common.WorkspaceId, userId : Common.UserId, role : Types.MemberRole) : async () {
    WorkspaceLib.inviteMember(workspaceMembers, workspaces, caller, workspaceId, userId, role);
  };

  public query func listMembers(workspaceId : Common.WorkspaceId) : async [Types.WorkspaceMember] {
    WorkspaceLib.listMembers(workspaceMembers, workspaceId);
  };

  public shared ({ caller }) func updateMemberRole(workspaceId : Common.WorkspaceId, userId : Common.UserId, newRole : Types.MemberRole) : async () {
    WorkspaceLib.updateMemberRole(workspaceMembers, workspaces, caller, workspaceId, userId, newRole);
  };

  public shared ({ caller }) func removeMember(workspaceId : Common.WorkspaceId, userId : Common.UserId) : async () {
    WorkspaceLib.removeMember(workspaceMembers, workspaces, caller, workspaceId, userId);
  };

  // Returns ownerId of a workspace (for frontend creator checks)
  public query func getWorkspaceOwner(workspaceId : Common.WorkspaceId) : async ?Common.UserId {
    func matchId(w : Types.Workspace) : Bool { w.id == workspaceId };
    switch (workspaces.find(matchId)) {
      case (?ws) { ?ws.ownerId };
      case null { null };
    };
  };

  // Returns true if caller is the workspace owner/creator
  public query ({ caller }) func isWorkspaceCreator(workspaceId : Common.WorkspaceId) : async Bool {
    func matchId(w : Types.Workspace) : Bool { w.id == workspaceId };
    switch (workspaces.find(matchId)) {
      case (?ws) { Principal.equal(ws.ownerId, caller) };
      case null { false };
    };
  };
};
