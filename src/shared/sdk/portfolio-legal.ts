import type { AxiosInstance } from "axios";

export type LegalSection = {
  heading: string;
  body: string;
};

export type LegalDocument = {
  _id: string;
  slug: string;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
  isPublished: boolean;
  order: number;
};

/**
 * Legal documents.
 *
 * The API is guarded by `/portfolio/legal`, a menu granted to no role, so every
 * call here succeeds only for a super admin. That is intentional — see
 * SUPER_ADMIN_ONLY_MENUS in the server's seed-rbac.ts.
 */
export async function listLegalDocuments(api: AxiosInstance): Promise<LegalDocument[]> {
  const response = await api.get<{ items: LegalDocument[] }>("/api/v1/portfolio/legal");
  return response.data.items ?? [];
}

export async function createLegalDocument(
  api: AxiosInstance,
  payload: Partial<Omit<LegalDocument, "_id">>
): Promise<LegalDocument> {
  const response = await api.post<LegalDocument>("/api/v1/portfolio/legal", payload);
  return response.data;
}

export async function updateLegalDocument(
  api: AxiosInstance,
  id: string,
  payload: Partial<Omit<LegalDocument, "_id">>
): Promise<LegalDocument> {
  const response = await api.patch<LegalDocument>(`/api/v1/portfolio/legal/${id}`, payload);
  return response.data;
}

export async function deleteLegalDocument(api: AxiosInstance, id: string): Promise<void> {
  await api.delete(`/api/v1/portfolio/legal/${id}`);
}
