import Common "../types/common";
import Types "../types/bucket";
import WTypes "../types/workspace";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

module {
  public func toPublic(bucket : Types.TaskBucket) : Types.TaskBucketPublic {
    {
      id = bucket.id;
      workspaceId = bucket.workspaceId;
      name = bucket.name;
      color = bucket.color;
      createdAt = bucket.createdAt;
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

  public func createBucket(
    buckets : List.List<Types.TaskBucket>,
    members : Map.Map<Common.WorkspaceId, List.List<WTypes.WorkspaceMember>>,
    nextId : Nat,
    caller : Common.UserId,
    args : Types.CreateBucketArgs,
  ) : Types.TaskBucketPublic {
    if (not isMember(members, args.workspaceId, caller)) {
      Runtime.trap("Unauthorized: not a workspace member");
    };
    let bucket : Types.TaskBucket = {
      id = nextId;
      workspaceId = args.workspaceId;
      var name = args.name;
      var color = args.color;
      createdAt = Time.now();
    };
    buckets.add(bucket);
    toPublic(bucket);
  };

  public func getBucket(
    buckets : List.List<Types.TaskBucket>,
    bucketId : Common.BucketId,
  ) : ?Types.TaskBucketPublic {
    func matchId(b : Types.TaskBucket) : Bool { b.id == bucketId };
    switch (buckets.find(matchId)) {
      case (?b) { ?toPublic(b) };
      case null { null };
    };
  };

  public func listBuckets(
    buckets : List.List<Types.TaskBucket>,
    workspaceId : Common.WorkspaceId,
  ) : [Types.TaskBucketPublic] {
    func matchWorkspace(b : Types.TaskBucket) : Bool { b.workspaceId == workspaceId };
    buckets.filter(matchWorkspace)
      .map<Types.TaskBucket, Types.TaskBucketPublic>(func(b) { toPublic(b) })
      .toArray();
  };

  public func updateBucket(
    buckets : List.List<Types.TaskBucket>,
    members : Map.Map<Common.WorkspaceId, List.List<WTypes.WorkspaceMember>>,
    caller : Common.UserId,
    bucketId : Common.BucketId,
    args : Types.UpdateBucketArgs,
  ) : Types.TaskBucketPublic {
    func matchId(b : Types.TaskBucket) : Bool { b.id == bucketId };
    let bucket = switch (buckets.find(matchId)) {
      case (?b) { b };
      case null { Runtime.trap("Bucket not found") };
    };
    if (not isMember(members, bucket.workspaceId, caller)) {
      Runtime.trap("Unauthorized: not a workspace member");
    };
    bucket.name := args.name;
    bucket.color := args.color;
    toPublic(bucket);
  };

  public func deleteBucket(
    buckets : List.List<Types.TaskBucket>,
    members : Map.Map<Common.WorkspaceId, List.List<WTypes.WorkspaceMember>>,
    caller : Common.UserId,
    bucketId : Common.BucketId,
  ) : () {
    func matchId(b : Types.TaskBucket) : Bool { b.id == bucketId };
    func notMatchId(b : Types.TaskBucket) : Bool { b.id != bucketId };
    let bucket = switch (buckets.find(matchId)) {
      case (?b) { b };
      case null { Runtime.trap("Bucket not found") };
    };
    if (not isMember(members, bucket.workspaceId, caller)) {
      Runtime.trap("Unauthorized: not a workspace member");
    };
    let filtered = buckets.filter(notMatchId);
    buckets.clear();
    buckets.append(filtered);
  };
};
