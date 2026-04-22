import Common "../types/common";
import TaskTypes "../types/task";
import WTypes "../types/workspace";
import TaskLib "../lib/task";
import List "mo:core/List";
import Map "mo:core/Map";

mixin (
  tasks : List.List<TaskTypes.Task>,
  workspaceMembers : Map.Map<Common.WorkspaceId, List.List<WTypes.WorkspaceMember>>,
  nextTaskId : [var Nat],
) {
  public shared ({ caller }) func createTask(args : TaskTypes.CreateTaskArgs) : async TaskTypes.TaskPublic {
    let task = TaskLib.createTask(tasks, workspaceMembers, nextTaskId[0], caller, args);
    nextTaskId[0] += 1;
    task;
  };

  public query func getTask(taskId : Common.TaskId) : async ?TaskTypes.TaskPublic {
    TaskLib.getTask(tasks, taskId);
  };

  public query func listTasksBySprint(workspaceId : Common.WorkspaceId, sprintId : Common.SprintId) : async [TaskTypes.TaskPublic] {
    TaskLib.listTasksBySprint(tasks, workspaceId, sprintId);
  };

  public query func listTasksByColumn(workspaceId : Common.WorkspaceId, column : TaskTypes.Column) : async [TaskTypes.TaskPublic] {
    TaskLib.listTasksByColumn(tasks, workspaceId, column);
  };

  public query func listTasksByAssignee(workspaceId : Common.WorkspaceId, assigneeId : Common.UserId) : async [TaskTypes.TaskPublic] {
    TaskLib.listTasksByAssignee(tasks, workspaceId, assigneeId);
  };

  public shared ({ caller }) func updateTask(taskId : Common.TaskId, args : TaskTypes.UpdateTaskArgs) : async TaskTypes.TaskPublic {
    TaskLib.updateTask(tasks, workspaceMembers, caller, taskId, args);
  };

  public shared ({ caller }) func moveTask(args : TaskTypes.MoveTaskArgs) : async TaskTypes.TaskPublic {
    TaskLib.moveTask(tasks, workspaceMembers, caller, args);
  };

  public shared ({ caller }) func deleteTask(taskId : Common.TaskId) : async () {
    TaskLib.deleteTask(tasks, workspaceMembers, caller, taskId);
  };
};
