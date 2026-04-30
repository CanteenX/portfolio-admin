import type { AxiosInstance } from "axios";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TechStack = {
  _id: string;
  name: string;
  image: string;
  description: string;
  isActive: boolean;
  order: number;
};

export type Category = {
  _id: string;
  name: string;
  isActive: boolean;
  order: number;
};

export type Year = {
  _id: string;
  year: string;
  isActive: boolean;
  order: number;
};

export type Client = {
  _id: string;
  name: string;
  isActive: boolean;
  order: number;
};

// ── Image upload ──────────────────────────────────────────────────────────────

export async function uploadPortfolioImage(api: AxiosInstance, file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post<{ url: string }>("/api/v1/portfolio/upload/image", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return response.data.url;
}

// ── Tech Stack ────────────────────────────────────────────────────────────────

export async function listTechStacks(api: AxiosInstance): Promise<TechStack[]> {
  const response = await api.get<{ items: TechStack[] }>("/api/v1/portfolio/tech-stacks");
  return response.data.items;
}

export async function createTechStack(
  api: AxiosInstance,
  payload: Omit<TechStack, "_id">
): Promise<TechStack> {
  const response = await api.post<TechStack>("/api/v1/portfolio/tech-stacks", payload);
  return response.data;
}

export async function updateTechStack(
  api: AxiosInstance,
  id: string,
  payload: Partial<Omit<TechStack, "_id">>
): Promise<TechStack> {
  const response = await api.patch<TechStack>(`/api/v1/portfolio/tech-stacks/${id}`, payload);
  return response.data;
}

export async function deleteTechStack(api: AxiosInstance, id: string): Promise<void> {
  await api.delete(`/api/v1/portfolio/tech-stacks/${id}`);
}

// ── Category ──────────────────────────────────────────────────────────────────

export async function listCategories(api: AxiosInstance): Promise<Category[]> {
  const response = await api.get<{ items: Category[] }>("/api/v1/portfolio/categories");
  return response.data.items;
}

export async function createCategory(
  api: AxiosInstance,
  payload: Omit<Category, "_id">
): Promise<Category> {
  const response = await api.post<Category>("/api/v1/portfolio/categories", payload);
  return response.data;
}

export async function updateCategory(
  api: AxiosInstance,
  id: string,
  payload: Partial<Omit<Category, "_id">>
): Promise<Category> {
  const response = await api.patch<Category>(`/api/v1/portfolio/categories/${id}`, payload);
  return response.data;
}

export async function deleteCategory(api: AxiosInstance, id: string): Promise<void> {
  await api.delete(`/api/v1/portfolio/categories/${id}`);
}

// ── Year ──────────────────────────────────────────────────────────────────────

export async function listYears(api: AxiosInstance): Promise<Year[]> {
  const response = await api.get<{ items: Year[] }>("/api/v1/portfolio/years");
  return response.data.items;
}

export async function createYear(
  api: AxiosInstance,
  payload: Omit<Year, "_id">
): Promise<Year> {
  const response = await api.post<Year>("/api/v1/portfolio/years", payload);
  return response.data;
}

export async function updateYear(
  api: AxiosInstance,
  id: string,
  payload: Partial<Omit<Year, "_id">>
): Promise<Year> {
  const response = await api.patch<Year>(`/api/v1/portfolio/years/${id}`, payload);
  return response.data;
}

export async function deleteYear(api: AxiosInstance, id: string): Promise<void> {
  await api.delete(`/api/v1/portfolio/years/${id}`);
}

// ── Client ────────────────────────────────────────────────────────────────────

export async function listClients(api: AxiosInstance): Promise<Client[]> {
  const response = await api.get<{ items: Client[] }>("/api/v1/portfolio/clients");
  return response.data.items;
}

export async function createClient(
  api: AxiosInstance,
  payload: Omit<Client, "_id">
): Promise<Client> {
  const response = await api.post<Client>("/api/v1/portfolio/clients", payload);
  return response.data;
}

export async function updateClient(
  api: AxiosInstance,
  id: string,
  payload: Partial<Omit<Client, "_id">>
): Promise<Client> {
  const response = await api.patch<Client>(`/api/v1/portfolio/clients/${id}`, payload);
  return response.data;
}

export async function deleteClient(api: AxiosInstance, id: string): Promise<void> {
  await api.delete(`/api/v1/portfolio/clients/${id}`);
}
