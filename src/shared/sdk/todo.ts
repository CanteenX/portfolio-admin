import type { TodoItem } from "@admin-platform/shared-types";
import type { AxiosInstance } from "axios";

export async function listTodoItems(
  api: AxiosInstance,
  params: { page?: number; limit?: number; status?: string } = {}
): Promise<{ items: TodoItem[]; page: number; limit: number; total: number }> {
  const query: Record<string, unknown> = { page: params.page ?? 1, limit: params.limit ?? 25 };
  if (params.status) query.status = params.status;
  const response = await api.get<{ items: TodoItem[]; page: number; limit: number; total: number }>(
    "/api/v1/todo/items",
    { params: query }
  );
  return response.data;
}

export async function createTodoItem(
  api: AxiosInstance,
  payload: {
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high";
    dueDate?: string;
    tags?: string[];
  }
): Promise<TodoItem> {
  const response = await api.post<TodoItem>("/api/v1/todo/items", payload);
  return response.data;
}

export async function getTodoItem(api: AxiosInstance, itemId: string): Promise<TodoItem> {
  const response = await api.get<TodoItem>(`/api/v1/todo/items/${itemId}`);
  return response.data;
}

export async function updateTodoItem(
  api: AxiosInstance,
  itemId: string,
  payload: {
    title?: string;
    description?: string;
    priority?: "low" | "medium" | "high";
    dueDate?: string | null;
    tags?: string[];
  }
): Promise<TodoItem> {
  const response = await api.patch<TodoItem>(`/api/v1/todo/items/${itemId}`, payload);
  return response.data;
}

export async function completeTodoItem(api: AxiosInstance, itemId: string): Promise<TodoItem> {
  const response = await api.post<TodoItem>(`/api/v1/todo/items/${itemId}/complete`);
  return response.data;
}

export async function reopenTodoItem(api: AxiosInstance, itemId: string): Promise<TodoItem> {
  const response = await api.post<TodoItem>(`/api/v1/todo/items/${itemId}/reopen`);
  return response.data;
}

export async function deleteTodoItem(api: AxiosInstance, itemId: string): Promise<void> {
  await api.delete(`/api/v1/todo/items/${itemId}`);
}

export async function getTodoInsights(api: AxiosInstance): Promise<{
  counts: {
    pending: number;
    completed: number;
    overdue: number;
    totalItems: number;
  };
}> {
  const response = await api.get<{
    counts: {
      pending: number;
      completed: number;
      overdue: number;
      totalItems: number;
    };
  }>("/api/v1/todo/insights");
  return response.data;
}
