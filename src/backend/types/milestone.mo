import Common "common";

module {
  // Option 1: 2 sprints x 15 days = 30 days total
  // Option 2: 4 sprints x 7 days = 28 days total
  public type SprintTemplate = {
    #TwoSprints;
    #FourSprints;
  };

  public type Milestone = {
    id : Common.MilestoneId;
    workspaceId : Common.WorkspaceId;
    var name : Text;
    var startDate : Common.Timestamp;
    var endDate : Common.Timestamp;
    createdBy : Common.UserId;
    createdAt : Common.Timestamp;
  };

  public type MilestonePublic = {
    id : Common.MilestoneId;
    workspaceId : Common.WorkspaceId;
    name : Text;
    startDate : Common.Timestamp;
    endDate : Common.Timestamp;
    createdBy : Common.UserId;
    createdAt : Common.Timestamp;
  };

  public type CreateMilestoneArgs = {
    workspaceId : Common.WorkspaceId;
    name : Text;
    startDate : Common.Timestamp;
    endDate : Common.Timestamp;
    template : SprintTemplate;
  };

  public type UpdateMilestoneArgs = {
    name : Text;
    startDate : Common.Timestamp;
    endDate : Common.Timestamp;
  };
};
