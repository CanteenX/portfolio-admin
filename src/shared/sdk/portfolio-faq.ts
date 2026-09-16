import type { AxiosInstance } from "axios";

export type PortfolioFaq = {
  _id: string;
  question: string;
  answer: string;
  /** Free text. Groups questions on the site; "" renders ungrouped, first. */
  category: string;
  isActive: boolean;
  order: number;
};

export async function listFaqs(api: AxiosInstance): Promise<PortfolioFaq[]> {
  const response = await api.get<{ items: PortfolioFaq[] }>("/api/v1/portfolio/faqs");
  return response.data.items ?? [];
}

export async function createFaq(
  api: AxiosInstance,
  payload: Partial<Omit<PortfolioFaq, "_id">>
): Promise<PortfolioFaq> {
  const response = await api.post<PortfolioFaq>("/api/v1/portfolio/faqs", payload);
  return response.data;
}

export async function updateFaq(
  api: AxiosInstance,
  id: string,
  payload: Partial<Omit<PortfolioFaq, "_id">>
): Promise<PortfolioFaq> {
  const response = await api.patch<PortfolioFaq>(`/api/v1/portfolio/faqs/${id}`, payload);
  return response.data;
}

export async function deleteFaq(api: AxiosInstance, id: string): Promise<void> {
  await api.delete(`/api/v1/portfolio/faqs/${id}`);
}
