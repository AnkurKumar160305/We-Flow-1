import { useCallback, useState } from "react";
import { MOCK_TASKS } from "../data/mockData";
import type { DoneSubLabel, Task, TaskStatus } from "../types";

export interface TaskStore {
  tasks: Task[];
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksBySprintId: (sprintId: string) => Task[];
  moveTask: (
    taskId: string,
    newStatus: TaskStatus,
    doneSubLabel?: DoneSubLabel,
  ) => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
}

export function useTaskStore(initialTasks: Task[] = MOCK_TASKS): TaskStore {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => tasks.filter((t) => t.status === status),
    [tasks],
  );

  const getTasksBySprintId = useCallback(
    (sprintId: string) => tasks.filter((t) => t.sprintId === sprintId),
    [tasks],
  );

  const moveTask = useCallback(
    (taskId: string, newStatus: TaskStatus, doneSubLabel?: DoneSubLabel) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                status: newStatus,
                doneSubLabel:
                  newStatus === "done"
                    ? (doneSubLabel ?? "needs_review")
                    : undefined,
                updatedAt: new Date().toISOString(),
              }
            : t,
        ),
      );
    },
    [],
  );

  const addTask = useCallback(
    (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">): Task => {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    },
    [],
  );

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, ...updates, updatedAt: new Date().toISOString() }
          : t,
      ),
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  return {
    tasks,
    getTasksByStatus,
    getTasksBySprintId,
    moveTask,
    addTask,
    updateTask,
    deleteTask,
  };
}
