import type { Task } from "@admin-platform/shared-types";
import type { AxiosInstance } from "axios";

export async function listTasks(
  api: AxiosInstance,
  params: { page?: number; limit?: number; status?: string; projectId?: string; assigneeUserId?: string } = {}
): Promise<{ items: Task[]; page: number; limit: number; total: number }> {
  const query: Record<string, unknown> = { page: params.page ?? 1, limit: params.limit ?? 25 };
  if (params.status) query.status = params.status;
  if (params.projectId) query.projectId = params.projectId;
  if (params.assigneeUserId) query.assigneeUserId = params.assigneeUserId;
  const response = await api.get<{ items: Task[]; page: number; limit: number; total: number }>(
    "/api/v1/tasks/tasks",
    { params: query }
  );
  return response.data;
}

export async function createTask(
  api: AxiosInstance,
  payload: {
    title: string;
    description?: string;
    projectId?: string;
    priority?: "low" | "medium" | "high" | "critical";
    assigneeUserId?: string;
    dueDate?: string;
    tags?: string[];
    estimatedHours?: number;
  }
): Promise<Task> {
  const response = await api.post<Task>("/api/v1/tasks/tasks", payload);
  return response.data;
}

export async function getTask(api: AxiosInstance, taskId: string): Promise<Task> {
  const response = await api.get<Task>(`/api/v1/tasks/tasks/${taskId}`);
  return response.data;
}

export async function updateTask(
  api: AxiosInstance,
  taskId: string,
  payload: {
    title?: string;
    description?: string;
    priority?: "low" | "medium" | "high" | "critical";
    assigneeUserId?: string | null;
    dueDate?: string | null;
    tags?: string[];
    estimatedHours?: number | null;
  }
): Promise<Task> {
  const response = await api.patch<Task>(`/api/v1/tasks/tasks/${taskId}`, payload);
  return response.data;
}

export async function transitionTask(
  api: AxiosInstance,
  taskId: string,
  payload: { to: "todo" | "in_progress" | "review" | "done" | "cancelled" }
): Promise<Task> {
  const response = await api.post<Task>(`/api/v1/tasks/tasks/${taskId}/transition`, payload);
  return response.data;
}

export async function deleteTask(api: AxiosInstance, taskId: string): Promise<void> {
  await api.delete(`/api/v1/tasks/tasks/${taskId}`);
}

export async function getTaskInsights(api: AxiosInstance): Promise<{
  counts: {
    todo: number;
    inProgress: number;
    review: number;
    done: number;
    cancelled: number;
    totalTasks: number;
    overdue: number;
  };
}> {
  const response = await api.get<{
    counts: {
      todo: number;
      inProgress: number;
      review: number;
      done: number;
      cancelled: number;
      totalTasks: number;
      overdue: number;
    };
  }>("/api/v1/tasks/insights");
  return response.data;
}
