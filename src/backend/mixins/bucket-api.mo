import Common "../types/common";
import BucketTypes "../types/bucket";
import WTypes "../types/workspace";
import BucketLib "../lib/bucket";
import List "mo:core/List";
import Map "mo:core/Map";

mixin (
  buckets : List.List<BucketTypes.TaskBucket>,
  workspaceMembers : Map.Map<Common.WorkspaceId, List.List<WTypes.WorkspaceMember>>,
  nextBucketId : [var Nat],
) {
  public shared ({ caller }) func createBucket(args : BucketTypes.CreateBucketArgs) : async BucketTypes.TaskBucketPublic {
    let bucket = BucketLib.createBucket(buckets, workspaceMembers, nextBucketId[0], caller, args);
    nextBucketId[0] += 1;
    bucket;
  };

  public query func getBucket(bucketId : Common.BucketId) : async ?BucketTypes.TaskBucketPublic {
    BucketLib.getBucket(buckets, bucketId);
  };

  public query func listBuckets(workspaceId : Common.WorkspaceId) : async [BucketTypes.TaskBucketPublic] {
    BucketLib.listBuckets(buckets, workspaceId);
  };

  public shared ({ caller }) func updateBucket(bucketId : Common.BucketId, args : BucketTypes.UpdateBucketArgs) : async BucketTypes.TaskBucketPublic {
    BucketLib.updateBucket(buckets, workspaceMembers, caller, bucketId, args);
  };

  public shared ({ caller }) func deleteBucket(bucketId : Common.BucketId) : async () {
    BucketLib.deleteBucket(buckets, workspaceMembers, caller, bucketId);
  };
};
