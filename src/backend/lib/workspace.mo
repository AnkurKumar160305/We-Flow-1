import Common "../types/common";
import Types "../types/workspace";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

module {
  public func toPublic(profile : Types.UserProfile) : Types.UserProfilePublic {
    {
      id = profile.id;
      name = profile.name;
      title = profile.title;
      bio = profile.bio;
      department = profile.department;
      avatarUrl = profile.avatarUrl;
      onboardingComplete = profile.onboardingComplete;
      createdAt = profile.createdAt;
    };
  };

  public func createProfile(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
  ) : Types.UserProfilePublic {
    switch (profiles.get(caller)) {
      case (?existing) { toPublic(existing) };
      case null {
        let profile : Types.UserProfile = {
          id = caller;
          var name = "";
          var title = "";
          var bio = "";
          var department = "";
          var avatarUrl = "";
          var onboardingComplete = false;
          createdAt = Time.now();
        };
        profiles.add(caller, profile);
        toPublic(profile);
      };
    };
  };

  public func getProfile(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    userId : Common.UserId,
  ) : ?Types.UserProfilePublic {
    switch (profiles.get(userId)) {
      case (?p) { ?toPublic(p) };
      case null { null };
    };
  };

  public func updateProfile(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
    args : Types.UpdateProfileArgs,
  ) : Types.UserProfilePublic {
    let profile = switch (profiles.get(caller)) {
      case (?p) { p };
      case null {
        let p : Types.UserProfile = {
          id = caller;
          var name = "";
          var title = "";
          var bio = "";
          var department = "";
          var avatarUrl = "";
          var onboardingComplete = false;
          createdAt = Time.now();
        };
        profiles.add(caller, p);
        p;
      };
    };
    profile.name := args.name;
    profile.title := args.title;
    profile.bio := args.bio;
    profile.department := args.department;
    profile.avatarUrl := args.avatarUrl;
    profile.onboardingComplete := args.onboardingComplete;
    toPublic(profile);
  };

  public func completeOnboarding(
    profiles : Map.Map<Common.UserId, Types.UserProfile>,
    caller : Common.UserId,
  ) : () {
    switch (profiles.get(caller)) {
      case (?p) { p.onboardingComplete := true };
      case null { Runtime.trap("Profile not found") };
    };
  };

  public func createWorkspace(
    workspaces : List.List<Types.Workspace>,
    members : Map.Map<Common.WorkspaceId, List.List<Types.WorkspaceMember>>,
    nextId : Nat,
    caller : Common.UserId,
    args : Types.CreateWorkspaceArgs,
  ) : Types.Workspace {
    let workspace : Types.Workspace = {
      id = nextId;
      name = args.name;
      tagline = args.tagline;
      logoUrl = args.logoUrl;
      ownerId = caller;
      createdAt = Time.now();
    };
    workspaces.add(workspace);
    let memberList = List.empty<Types.WorkspaceMember>();
    let adminMember : Types.WorkspaceMember = {
      userId = caller;
      role = #Admin;
      joinedAt = Time.now();
    };
    memberList.add(adminMember);
    members.add(nextId, memberList);
    workspace;
  };

  public func getWorkspace(
    workspaces : List.List<Types.Workspace>,
    workspaceId : Common.WorkspaceId,
  ) : ?Types.Workspace {
    func matchId(w : Types.Workspace) : Bool { w.id == workspaceId };
    workspaces.find(matchId);
  };

  public func getUserWorkspaces(
    workspaces : List.List<Types.Workspace>,
    members : Map.Map<Common.WorkspaceId, List.List<Types.WorkspaceMember>>,
    userId : Common.UserId,
  ) : [Types.Workspace] {
    func isMemberOfWs(w : Types.Workspace) : Bool {
      switch (members.get(w.id)) {
        case (?memberList) {
          func matchUser(m : Types.WorkspaceMember) : Bool {
            Principal.equal(m.userId, userId)
          };
          memberList.find(matchUser) != null
        };
        case null { false };
      };
    };
    workspaces.filter(isMemberOfWs).toArray();
  };

  func getMemberRole(
    members : Map.Map<Common.WorkspaceId, List.List<Types.WorkspaceMember>>,
    workspaceId : Common.WorkspaceId,
    userId : Common.UserId,
  ) : ?Types.MemberRole {
    switch (members.get(workspaceId)) {
      case (?ml) {
        func matchUser(m : Types.WorkspaceMember) : Bool {
          Principal.equal(m.userId, userId)
        };
        switch (ml.find(matchUser)) {
          case (?m) { ?m.role };
          case null { null };
        }
      };
      case null { null };
    };
  };

  public func inviteMember(
    members : Map.Map<Common.WorkspaceId, List.List<Types.WorkspaceMember>>,
    _workspaces : List.List<Types.Workspace>,
    caller : Common.UserId,
    workspaceId : Common.WorkspaceId,
    userId : Common.UserId,
    role : Types.MemberRole,
  ) : () {
    let callerRole = getMemberRole(members, workspaceId, caller);
    switch (callerRole) {
      case (? #Admin) {};
      case _ { Runtime.trap("Unauthorized: caller is not an Admin") };
    };
    let memberList = switch (members.get(workspaceId)) {
      case (?ml) { ml };
      case null {
        let ml = List.empty<Types.WorkspaceMember>();
        members.add(workspaceId, ml);
        ml;
      };
    };
    func matchUser(m : Types.WorkspaceMember) : Bool {
      Principal.equal(m.userId, userId)
    };
    switch (memberList.find(matchUser)) {
      case (?_) { Runtime.trap("User is already a member") };
      case null {};
    };
    let newMember : Types.WorkspaceMember = {
      userId = userId;
      role = role;
      joinedAt = Time.now();
    };
    memberList.add(newMember);
  };

  public func listMembers(
    members : Map.Map<Common.WorkspaceId, List.List<Types.WorkspaceMember>>,
    workspaceId : Common.WorkspaceId,
  ) : [Types.WorkspaceMember] {
    switch (members.get(workspaceId)) {
      case (?ml) { ml.toArray() };
      case null { [] };
    };
  };

  public func updateMemberRole(
    members : Map.Map<Common.WorkspaceId, List.List<Types.WorkspaceMember>>,
    _workspaces : List.List<Types.Workspace>,
    caller : Common.UserId,
    workspaceId : Common.WorkspaceId,
    userId : Common.UserId,
    newRole : Types.MemberRole,
  ) : () {
    let callerRole = getMemberRole(members, workspaceId, caller);
    switch (callerRole) {
      case (? #Admin) {};
      case _ { Runtime.trap("Unauthorized: caller is not an Admin") };
    };
    switch (members.get(workspaceId)) {
      case (?ml) {
        ml.mapInPlace(func(m : Types.WorkspaceMember) : Types.WorkspaceMember {
          if (Principal.equal(m.userId, userId)) {
            { m with role = newRole }
          } else { m }
        })
      };
      case null { Runtime.trap("Workspace not found") };
    };
  };

  public func removeMember(
    members : Map.Map<Common.WorkspaceId, List.List<Types.WorkspaceMember>>,
    _workspaces : List.List<Types.Workspace>,
    caller : Common.UserId,
    workspaceId : Common.WorkspaceId,
    userId : Common.UserId,
  ) : () {
    let callerRole = getMemberRole(members, workspaceId, caller);
    switch (callerRole) {
      case (? #Admin) {};
      case _ { Runtime.trap("Unauthorized: caller is not an Admin") };
    };
    switch (members.get(workspaceId)) {
      case (?ml) {
        func notMatchUser(m : Types.WorkspaceMember) : Bool {
          not Principal.equal(m.userId, userId)
        };
        let filtered = ml.filter(notMatchUser);
        ml.clear();
        ml.append(filtered);
      };
      case null { Runtime.trap("Workspace not found") };
    };
  };
};
