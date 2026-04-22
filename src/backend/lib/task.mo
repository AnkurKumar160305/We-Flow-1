import Common "../types/common";
import Types "../types/task";
import WTypes "../types/workspace";
import List "mo:core/List";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

module {
  public func toPublic(task : Types.Task) : Types.TaskPublic {
    {
      id = task.id;
      workspaceId = task.workspaceId;
      title = task.title;
      description = task.description;
      columnId = task.columnId;
      sprintId = task.sprintId;
      assigneeId = task.assigneeId;
      department = task.department;
      dueDate = task.dueDate;
      priority = task.priority;
      status = task.status;
      order = task.order;
      blockerReason = task.blockerReason;
      bucketId = task.bucketId;
      createdAt = task.createdAt;
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

  public func createTask(
    tasks : List.List<Types.Task>,
    members : Map.Map<Common.WorkspaceId, List.List<WTypes.WorkspaceMember>>,
    nextId : Nat,
    caller : Common.UserId,
    args : Types.CreateTaskArgs,
  ) : Types.TaskPublic {
    if (not isMember(members, args.workspaceId, caller)) {
      Runtime.trap("Unauthorized: not a workspace member");
    };
    let task : Types.Task = {
      id = nextId;
      workspaceId = args.workspaceId;
      var title = args.title;
      var description = args.description;
      var columnId = args.columnId;
      var sprintId = args.sprintId;
      var assigneeId = args.assigneeId;
      var department = args.department;
      var dueDate = args.dueDate;
      var priority = args.priority;
      var status = #Open;
      var order = args.order;
      var blockerReason = "";
      var bucketId = args.bucketId;
      createdAt = Time.now();
    };
    tasks.add(task);
    toPublic(task);
  };

  public func getTask(
    tasks : List.List<Types.Task>,
    taskId : Common.TaskId,
  ) : ?Types.TaskPublic {
    func matchId(t : Types.Task) : Bool { t.id == taskId };
    switch (tasks.find(matchId)) {
      case (?t) { ?toPublic(t) };
      case null { null };
    };
  };

  public func listTasksBySprint(
    tasks : List.List<Types.Task>,
    workspaceId : Common.WorkspaceId,
    sprintId : Common.SprintId,
  ) : [Types.TaskPublic] {
    func matchSprint(t : Types.Task) : Bool {
      t.workspaceId == workspaceId and t.sprintId == ?sprintId
    };
    tasks.filter(matchSprint)
      .map<Types.Task, Types.TaskPublic>(func(t) { toPublic(t) })
      .toArray();
  };

  public func listTasksByColumn(
    tasks : List.List<Types.Task>,
    workspaceId : Common.WorkspaceId,
    column : Types.Column,
  ) : [Types.TaskPublic] {
    func matchColumn(t : Types.Task) : Bool {
      t.workspaceId == workspaceId and t.columnId == column
    };
    tasks.filter(matchColumn)
      .map<Types.Task, Types.TaskPublic>(func(t) { toPublic(t) })
      .toArray();
  };

  public func listTasksByAssignee(
    tasks : List.List<Types.Task>,
    workspaceId : Common.WorkspaceId,
    assigneeId : Common.UserId,
  ) : [Types.TaskPublic] {
    func matchAssignee(t : Types.Task) : Bool {
      t.workspaceId == workspaceId and t.assigneeId == ?assigneeId
    };
    tasks.filter(matchAssignee)
      .map<Types.Task, Types.TaskPublic>(func(t) { toPublic(t) })
      .toArray();
  };

  public func updateTask(
    tasks : List.List<Types.Task>,
    members : Map.Map<Common.WorkspaceId, List.List<WTypes.WorkspaceMember>>,
    caller : Common.UserId,
    taskId : Common.TaskId,
    args : Types.UpdateTaskArgs,
  ) : Types.TaskPublic {
    func matchId(t : Types.Task) : Bool { t.id == taskId };
    let task = switch (tasks.find(matchId)) {
      case (?t) { t };
      case null { Runtime.trap("Task not found") };
    };
    if (not isMember(members, task.workspaceId, caller)) {
      Runtime.trap("Unauthorized: not a workspace member");
    };
    task.title := args.title;
    task.description := args.description;
    task.columnId := args.columnId;
    task.sprintId := args.sprintId;
    task.assigneeId := args.assigneeId;
    task.department := args.department;
    task.dueDate := args.dueDate;
    task.priority := args.priority;
    task.status := args.status;
    task.order := args.order;
    task.blockerReason := args.blockerReason;
    task.bucketId := args.bucketId;
    toPublic(task);
  };

  public func moveTask(
    tasks : List.List<Types.Task>,
    members : Map.Map<Common.WorkspaceId, List.List<WTypes.WorkspaceMember>>,
    caller : Common.UserId,
    args : Types.MoveTaskArgs,
  ) : Types.TaskPublic {
    func matchId(t : Types.Task) : Bool { t.id == args.taskId };
    let task = switch (tasks.find(matchId)) {
      case (?t) { t };
      case null { Runtime.trap("Task not found") };
    };
    if (not isMember(members, task.workspaceId, caller)) {
      Runtime.trap("Unauthorized: not a workspace member");
    };
    task.columnId := args.newColumn;
    task.order := args.newOrder;
    task.blockerReason := args.blockerReason;
    task.status := switch (args.newColumn) {
      case (#Todo) { #Open };
      case (#Doing) { #InProgress };
      case (#Done) { #Completed };
      case (#Blocked) { #Blocked };
    };
    toPublic(task);
  };

  public func deleteTask(
    tasks : List.List<Types.Task>,
    members : Map.Map<Common.WorkspaceId, List.List<WTypes.WorkspaceMember>>,
    caller : Common.UserId,
    taskId : Common.TaskId,
  ) : () {
    func matchId(t : Types.Task) : Bool { t.id == taskId };
    func notMatchId(t : Types.Task) : Bool { t.id != taskId };
    let task = switch (tasks.find(matchId)) {
      case (?t) { t };
      case null { Runtime.trap("Task not found") };
    };
    if (not isMember(members, task.workspaceId, caller)) {
      Runtime.trap("Unauthorized: not a workspace member");
    };
    let filtered = tasks.filter(notMatchId);
    tasks.clear();
    tasks.append(filtered);
  };
};
