import { useCallback, useState } from "react";
import { KanbanBoard } from "../components/KanbanBoard";
import { Layout } from "../components/Layout";
import { LeftSidebar } from "../components/LeftSidebar";
import { NewSprintModal } from "../components/NewSprintModal";
import { RightSidebar } from "../components/RightSidebar";
import { MOCK_MEMBERS, MOCK_SPRINTS, MOCK_TASKS } from "../data/mockData";
import { useTaskStore } from "../hooks/useTaskStore";
import type { Sprint, Task, TaskStatus, WorkspaceMember } from "../types";

// ─── Sprint state hook ────────────────────────────────────────────────────────

function useSprintStore(initial: Sprint[]) {
  const [sprints, setSprints] = useState<Sprint[]>(initial);
  const [activeSprint, setActiveSprint] = useState<string>(
    initial.find((s) => s.status === "active")?.id ?? initial[0]?.id ?? "",
  );

  const addSprint = useCallback(
    (sprint: Omit<Sprint, "id" | "taskIds" | "velocity">) => {
      const newSprint: Sprint = {
        ...sprint,
        id: `sprint-${Date.now()}`,
        taskIds: [],
        velocity: 0,
      };
      setSprints((prev) => [...prev, newSprint]);
      return newSprint;
    },
    [],
  );

  return { sprints, activeSprint, setActiveSprint, addSprint };
}

// ─── Dashboard page ───────────────────────────────────────────────────────────

export default function Dashboard() {
  const { sprints, activeSprint, setActiveSprint, addSprint } =
    useSprintStore(MOCK_SPRINTS);
  const { tasks, addTask, moveTask, updateTask, deleteTask } =
    useTaskStore(MOCK_TASKS);
  const [newSprintOpen, setNewSprintOpen] = useState(false);

  const currentSprint = sprints.find((s) => s.id === activeSprint);

  const sprintTasks = tasks.filter((t) => t.sprintId === activeSprint);
  const shippedCount = sprintTasks.filter(
    (t) => t.status === "done" && t.doneSubLabel === "shipped",
  ).length;

  const handleMoveTask = useCallback(
    (taskId: string, newStatus: TaskStatus) => {
      moveTask(
        taskId,
        newStatus,
        newStatus === "done" ? "needs_review" : undefined,
      );
    },
    [moveTask],
  );

  const handleAddTask = useCallback(
    (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
      addTask(taskData);
    },
    [addTask],
  );

  const handleAddSprint = useCallback(
    (
      sprint: Omit<Sprint, "id" | "taskIds" | "velocity">,
      _members: WorkspaceMember[],
      _assignments: {
        memberId: string;
        taskIds: string[];
        newTasks: string[];
      }[],
    ) => {
      addSprint(sprint);
      setNewSprintOpen(false);
    },
    [addSprint],
  );

  return (
    <Layout>
      <div
        className="flex flex-1 overflow-hidden"
        style={{ height: "calc(100vh - 56px - 41px)" }}
      >
        <LeftSidebar
          sprints={sprints}
          activeSprint={activeSprint}
          onSelectSprint={setActiveSprint}
          onNewSprint={() => setNewSprintOpen(true)}
        />

        <main
          className="flex-1 flex flex-col overflow-hidden bg-background"
          data-ocid="board-main"
        >
          <KanbanBoard
            tasks={tasks}
            members={MOCK_MEMBERS}
            activeSprint={currentSprint}
            onMoveTask={handleMoveTask}
            onAddTask={handleAddTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
          />
        </main>

        <RightSidebar
          members={MOCK_MEMBERS}
          activeSprint={currentSprint}
          shippedCount={shippedCount}
          totalCount={sprintTasks.length}
        />
      </div>

      <NewSprintModal
        open={newSprintOpen}
        onClose={() => setNewSprintOpen(false)}
        onAdd={handleAddSprint}
        nextSprintNumber={sprints.length + 1}
      />
    </Layout>
  );
}
