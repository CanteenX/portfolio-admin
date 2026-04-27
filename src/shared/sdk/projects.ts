import type { Project } from "@admin-platform/shared-types";
import type { AxiosInstance } from "axios";

export async function listProjects(
  api: AxiosInstance,
  params: { page?: number; limit?: number; status?: string } = {}
): Promise<{ items: Project[]; page: number; limit: number; total: number }> {
  const query: Record<string, unknown> = { page: params.page ?? 1, limit: params.limit ?? 25 };
  if (params.status) query.status = params.status;
  const response = await api.get<{ items: Project[]; page: number; limit: number; total: number }>(
    "/api/v1/projects/projects",
    { params: query }
  );
  return response.data;
}

export async function createProject(
  api: AxiosInstance,
  payload: {
    name: string;
    description?: string;
    priority?: "low" | "medium" | "high" | "critical";
    startDate?: string;
    targetEndDate?: string;
    memberUserIds?: string[];
    tags?: string[];
  }
): Promise<Project> {
  const response = await api.post<Project>("/api/v1/projects/projects", payload);
  return response.data;
}

export async function getProject(api: AxiosInstance, projectId: string): Promise<Project> {
  const response = await api.get<Project>(`/api/v1/projects/projects/${projectId}`);
  return response.data;
}

export async function updateProject(
  api: AxiosInstance,
  projectId: string,
  payload: {
    name?: string;
    description?: string;
    priority?: "low" | "medium" | "high" | "critical";
    startDate?: string;
    targetEndDate?: string;
    tags?: string[];
  }
): Promise<Project> {
  const response = await api.patch<Project>(`/api/v1/projects/projects/${projectId}`, payload);
  return response.data;
}

export async function transitionProject(
  api: AxiosInstance,
  projectId: string,
  payload: { to: "planning" | "active" | "on_hold" | "completed" | "archived"; note?: string }
): Promise<Project> {
  const response = await api.post<Project>(`/api/v1/projects/projects/${projectId}/transition`, payload);
  return response.data;
}

export async function deleteProject(api: AxiosInstance, projectId: string): Promise<void> {
  await api.delete(`/api/v1/projects/projects/${projectId}`);
}

export async function addProjectMember(api: AxiosInstance, projectId: string, userId: string): Promise<Project> {
  const response = await api.post<Project>(`/api/v1/projects/projects/${projectId}/members`, { userId });
  return response.data;
}

export async function removeProjectMember(
  api: AxiosInstance,
  projectId: string,
  userId: string
): Promise<Project> {
  const response = await api.delete<Project>(`/api/v1/projects/projects/${projectId}/members/${userId}`);
  return response.data;
}

export async function getProjectInsights(api: AxiosInstance): Promise<{
  counts: {
    planning: number;
    active: number;
    onHold: number;
    completed: number;
    archived: number;
    totalProjects: number;
  };
}> {
  const response = await api.get<{
    counts: {
      planning: number;
      active: number;
      onHold: number;
      completed: number;
      archived: number;
      totalProjects: number;
    };
  }>("/api/v1/projects/insights");
  return response.data;
}
