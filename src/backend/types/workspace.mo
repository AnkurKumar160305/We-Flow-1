import Common "common";

module {
  public type MemberRole = {
    #Admin;
    #Lead;
    #Member;
    #CoCreator;
  };

  public type WorkspaceMember = {
    userId : Common.UserId;
    role : MemberRole;
    joinedAt : Common.Timestamp;
  };

  public type Workspace = {
    id : Common.WorkspaceId;
    name : Text;
    tagline : Text;
    logoUrl : Text;
    ownerId : Common.UserId;
    createdAt : Common.Timestamp;
  };

  public type UserProfile = {
    id : Common.UserId;
    var name : Text;
    var title : Text;
    var bio : Text;
    var department : Text;
    var avatarUrl : Text;
    var onboardingComplete : Bool;
    createdAt : Common.Timestamp;
  };

  public type UserProfilePublic = {
    id : Common.UserId;
    name : Text;
    title : Text;
    bio : Text;
    department : Text;
    avatarUrl : Text;
    onboardingComplete : Bool;
    createdAt : Common.Timestamp;
  };

  public type CreateWorkspaceArgs = {
    name : Text;
    tagline : Text;
    logoUrl : Text;
  };

  public type UpdateProfileArgs = {
    name : Text;
    title : Text;
    bio : Text;
    department : Text;
    avatarUrl : Text;
    onboardingComplete : Bool;
  };
};
