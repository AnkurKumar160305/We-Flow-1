import Common "common";

module {
  public type TaskBucket = {
    id : Common.BucketId;
    workspaceId : Common.WorkspaceId;
    var name : Text;
    var color : Text;
    createdAt : Common.Timestamp;
  };

  public type TaskBucketPublic = {
    id : Common.BucketId;
    workspaceId : Common.WorkspaceId;
    name : Text;
    color : Text;
    createdAt : Common.Timestamp;
  };

  public type CreateBucketArgs = {
    workspaceId : Common.WorkspaceId;
    name : Text;
    color : Text;
  };

  public type UpdateBucketArgs = {
    name : Text;
    color : Text;
  };
};
