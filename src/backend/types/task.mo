import Common "common";

module {
  public type Department = {
    #Engineering;
    #Design;
    #Marketing;
    #Operations;
    #Management;
  };

  public type Column = {
    #Todo;
    #Doing;
    #Done;
    #Blocked;
  };

  public type Priority = {
    #Low;
    #Medium;
    #High;
    #Critical;
  };

  public type TaskStatus = {
    #Open;
    #InProgress;
    #Completed;
    #Blocked;
  };

  public type Task = {
    id : Common.TaskId;
    workspaceId : Common.WorkspaceId;
    var title : Text;
    var description : Text;
    var columnId : Column;
    var sprintId : ?Common.SprintId;
    var assigneeId : ?Common.UserId;
    var department : ?Department;
    var dueDate : ?Common.Timestamp;
    var priority : Priority;
    var status : TaskStatus;
    var order : Nat;
    var blockerReason : Text;
    var bucketId : ?Common.BucketId;
    createdAt : Common.Timestamp;
  };

  public type TaskPublic = {
    id : Common.TaskId;
    workspaceId : Common.WorkspaceId;
    title : Text;
    description : Text;
    columnId : Column;
    sprintId : ?Common.SprintId;
    assigneeId : ?Common.UserId;
    department : ?Department;
    dueDate : ?Common.Timestamp;
    priority : Priority;
    status : TaskStatus;
    order : Nat;
    blockerReason : Text;
    bucketId : ?Common.BucketId;
    createdAt : Common.Timestamp;
  };

  public type CreateTaskArgs = {
    workspaceId : Common.WorkspaceId;
    title : Text;
    description : Text;
    columnId : Column;
    sprintId : ?Common.SprintId;
    assigneeId : ?Common.UserId;
    department : ?Department;
    dueDate : ?Common.Timestamp;
    priority : Priority;
    order : Nat;
    bucketId : ?Common.BucketId;
  };

  public type UpdateTaskArgs = {
    title : Text;
    description : Text;
    columnId : Column;
    sprintId : ?Common.SprintId;
    assigneeId : ?Common.UserId;
    department : ?Department;
    dueDate : ?Common.Timestamp;
    priority : Priority;
    status : TaskStatus;
    order : Nat;
    blockerReason : Text;
    bucketId : ?Common.BucketId;
  };

  public type MoveTaskArgs = {
    taskId : Common.TaskId;
    newColumn : Column;
    blockerReason : Text;
    newOrder : Nat;
  };
};
