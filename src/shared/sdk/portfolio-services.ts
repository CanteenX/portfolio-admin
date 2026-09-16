import type { AxiosInstance } from "axios";

export type PortfolioService = {
  _id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  icon: string;
  pointers: string[];
  highlights: string[];
  showInContactForm: boolean;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type PortfolioServicePayload = Omit<PortfolioService, "_id" | "createdAt" | "updatedAt">;

export async function listPortfolioServices(
  api: AxiosInstance,
  params: { page?: number; limit?: number } = {}
): Promise<{ items: PortfolioService[]; page: number; limit: number; total: number }> {
  const response = await api.get<{ items: PortfolioService[]; page: number; limit: number; total: number }>(
    "/api/v1/portfolio/services",
    { params: { page: params.page ?? 1, limit: params.limit ?? 50 } }
  );
  return response.data;
}

export async function createPortfolioService(
  api: AxiosInstance,
  payload: PortfolioServicePayload
): Promise<PortfolioService> {
  const response = await api.post<PortfolioService>("/api/v1/portfolio/services", payload);
  return response.data;
}

export async function updatePortfolioService(
  api: AxiosInstance,
  id: string,
  payload: Partial<PortfolioServicePayload>
): Promise<PortfolioService> {
  const response = await api.patch<PortfolioService>(`/api/v1/portfolio/services/${id}`, payload);
  return response.data;
}

export async function deletePortfolioService(api: AxiosInstance, id: string): Promise<void> {
  await api.delete(`/api/v1/portfolio/services/${id}`);
}
