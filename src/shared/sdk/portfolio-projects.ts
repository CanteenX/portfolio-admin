import type { AxiosInstance } from "axios";

export type RoiItem = {
  value: string;
  label: string;
  description: string;
  icon: string;
};

export type PortfolioProject = {
  _id: string;
  slug: string;
  title: string;
  category: string;
  metric: string;
  year: string;
  image: string;
  client: string;
  timeframe: string;
  role: string;
  stack: string[];
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  problem: string;
  solution: string;
  features: { title: string; description: string }[];
  gallery: { src: string; caption: string }[];
  roi: RoiItem[];
  roiSectionDescription: string;
  screens: { label: string; caption: string; description: string; image: string }[];
  workflowSteps: { step: string; title: string; description: string }[];
  stackSectionDescription: string;
  codeSnippet?: { language: string; label: string; code: string };
  architecture: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type PortfolioProjectPayload = Omit<PortfolioProject, "_id" | "createdAt" | "updatedAt">;

export async function listPortfolioProjects(
  api: AxiosInstance,
  params: { page?: number; limit?: number } = {}
): Promise<{ items: PortfolioProject[]; page: number; limit: number; total: number }> {
  const response = await api.get<{ items: PortfolioProject[]; page: number; limit: number; total: number }>(
    "/api/v1/portfolio/projects",
    { params: { page: params.page ?? 1, limit: params.limit ?? 20 } }
  );
  return response.data;
}

export async function createPortfolioProject(
  api: AxiosInstance,
  payload: PortfolioProjectPayload
): Promise<PortfolioProject> {
  const response = await api.post<PortfolioProject>("/api/v1/portfolio/projects", payload);
  return response.data;
}

export async function getPortfolioProject(api: AxiosInstance, id: string): Promise<PortfolioProject> {
  const response = await api.get<PortfolioProject>(`/api/v1/portfolio/projects/${id}`);
  return response.data;
}

export async function updatePortfolioProject(
  api: AxiosInstance,
  id: string,
  payload: Partial<PortfolioProjectPayload>
): Promise<PortfolioProject> {
  const response = await api.patch<PortfolioProject>(`/api/v1/portfolio/projects/${id}`, payload);
  return response.data;
}

export async function deletePortfolioProject(api: AxiosInstance, id: string): Promise<void> {
  await api.delete(`/api/v1/portfolio/projects/${id}`);
}
