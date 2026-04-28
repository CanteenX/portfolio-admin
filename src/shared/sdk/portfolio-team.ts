import type { AxiosInstance } from "axios";

export type PortfolioMember = {
  _id: string;
  id: string;
  slug: string;
  name: string;
  role: string;
  avatar: string;
  glow: string;
  accent: string;
  power: string;
  bio: string;
  personal: { location: string; email: string; languages: string[] };
  skills: { name: string; level: number }[];
  education: { year: string; degree: string; school: string }[];
  experience: { period: string; role: string; company: string; desc: string }[];
  projects: { type: string; title: string; tags: string[] }[];
  certificates: { title: string }[];
  socials: { github?: string; linkedin?: string; portfolio?: string };
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type PortfolioMemberPayload = Omit<PortfolioMember, "_id" | "createdAt" | "updatedAt">;

export async function listPortfolioTeam(
  api: AxiosInstance,
  params: { page?: number; limit?: number } = {}
): Promise<{ items: PortfolioMember[]; page: number; limit: number; total: number }> {
  const response = await api.get<{ items: PortfolioMember[]; page: number; limit: number; total: number }>(
    "/api/v1/portfolio/team",
    { params: { page: params.page ?? 1, limit: params.limit ?? 20 } }
  );
  return response.data;
}

export async function createPortfolioMember(
  api: AxiosInstance,
  payload: PortfolioMemberPayload
): Promise<PortfolioMember> {
  const response = await api.post<PortfolioMember>("/api/v1/portfolio/team", payload);
  return response.data;
}

export async function getPortfolioMember(api: AxiosInstance, id: string): Promise<PortfolioMember> {
  const response = await api.get<PortfolioMember>(`/api/v1/portfolio/team/${id}`);
  return response.data;
}

export async function updatePortfolioMember(
  api: AxiosInstance,
  id: string,
  payload: Partial<PortfolioMemberPayload>
): Promise<PortfolioMember> {
  const response = await api.patch<PortfolioMember>(`/api/v1/portfolio/team/${id}`, payload);
  return response.data;
}

export async function deletePortfolioMember(api: AxiosInstance, id: string): Promise<void> {
  await api.delete(`/api/v1/portfolio/team/${id}`);
}
