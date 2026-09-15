import type { AxiosInstance } from "axios";

export type SeoMeta = {
  _id: string;
  slug: string;
  pageTitle: string;
  category: "Marketing" | "Detail" | "Other";
  icon: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  noIndex: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SeoMetaPayload = Omit<SeoMeta, "_id" | "createdAt" | "updatedAt">;

export async function listSeoMeta(api: AxiosInstance): Promise<SeoMeta[]> {
  const response = await api.get<{ items: SeoMeta[] }>("/api/v1/seo");
  return response.data.items ?? [];
}

export async function getSeoMeta(api: AxiosInstance, id: string): Promise<SeoMeta> {
  const response = await api.get<SeoMeta>(`/api/v1/seo/${id}`);
  return response.data;
}

export async function createSeoMeta(
  api: AxiosInstance,
  payload: Partial<SeoMetaPayload>
): Promise<SeoMeta> {
  const response = await api.post<SeoMeta>("/api/v1/seo", payload);
  return response.data;
}

export async function updateSeoMeta(
  api: AxiosInstance,
  id: string,
  payload: Partial<SeoMetaPayload>
): Promise<SeoMeta> {
  const response = await api.patch<SeoMeta>(`/api/v1/seo/${id}`, payload);
  return response.data;
}

export async function deleteSeoMeta(api: AxiosInstance, id: string): Promise<void> {
  await api.delete(`/api/v1/seo/${id}`);
}
