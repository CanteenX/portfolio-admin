import type { AxiosInstance } from "axios";

export type PortfolioContact = {
  _id: string;
  name: string;
  email: string;
  service: string;
  callSlot: string;
  message: string;
  status: "new" | "read" | "replied";
  createdAt: string;
  updatedAt: string;
};

export async function listPortfolioContacts(
  api: AxiosInstance,
  params: { page?: number; limit?: number; status?: "new" | "read" | "replied" } = {}
): Promise<{ items: PortfolioContact[]; page: number; limit: number; total: number }> {
  const query: Record<string, unknown> = { page: params.page ?? 1, limit: params.limit ?? 20 };
  if (params.status) query.status = params.status;
  const response = await api.get<{ items: PortfolioContact[]; page: number; limit: number; total: number }>(
    "/api/v1/portfolio/contacts",
    { params: query }
  );
  return response.data;
}

export async function updateContactStatus(
  api: AxiosInstance,
  id: string,
  status: "new" | "read" | "replied"
): Promise<PortfolioContact> {
  const response = await api.patch<PortfolioContact>(`/api/v1/portfolio/contacts/${id}/status`, { status });
  return response.data;
}
