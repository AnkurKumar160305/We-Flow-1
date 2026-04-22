import Common "common";

module {
  public type SprintStatus = {
    #Active;
    #Completed;
    #Planned;
  };

  public type Sprint = {
    id : Common.SprintId;
    workspaceId : Common.WorkspaceId;
    var name : Text;
    var startDate : Common.Timestamp;
    var endDate : Common.Timestamp;
    var goal : Text;
    var status : SprintStatus;
    createdAt : Common.Timestamp;
  };

  public type SprintPublic = {
    id : Common.SprintId;
    workspaceId : Common.WorkspaceId;
    name : Text;
    startDate : Common.Timestamp;
    endDate : Common.Timestamp;
    goal : Text;
    status : SprintStatus;
    createdAt : Common.Timestamp;
  };

  public type CreateSprintArgs = {
    workspaceId : Common.WorkspaceId;
    name : Text;
    startDate : Common.Timestamp;
    endDate : Common.Timestamp;
    goal : Text;
  };

  public type UpdateSprintArgs = {
    name : Text;
    startDate : Common.Timestamp;
    endDate : Common.Timestamp;
    goal : Text;
    status : SprintStatus;
  };
};
