import type { FileManagerEntry, FileManagerInsights } from "@admin-platform/shared-types";
import type { AxiosInstance } from "axios";

export async function listFileManagerEntries(
  api: AxiosInstance,
  params: {
    parentId?: string | null;
    status?: "active" | "trashed" | "all";
    kind?: "file" | "folder" | "all";
    q?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<{ items: FileManagerEntry[]; page: number; limit: number; total: number }> {
  const response = await api.get<{ items: FileManagerEntry[]; page: number; limit: number; total: number }>(
    "/api/v1/file-manager/entries",
    {
      params: {
        parentId: params.parentId ?? null,
        status: params.status ?? "active",
        kind: params.kind ?? "all",
        q: params.q,
        page: params.page ?? 1,
        limit: params.limit ?? 25
      }
    }
  );
  return response.data;
}

export async function createFileManagerFolder(
  api: AxiosInstance,
  payload: { name: string; parentId?: string | null }
): Promise<FileManagerEntry> {
  const response = await api.post<FileManagerEntry>("/api/v1/file-manager/folders", payload);
  return response.data;
}

export async function createFileManagerFile(
  api: AxiosInstance,
  payload: {
    name: string;
    parentId?: string | null;
    sizeBytes: number;
    mimeType?: string;
    tags?: string[];
  }
): Promise<FileManagerEntry> {
  const response = await api.post<FileManagerEntry>("/api/v1/file-manager/files", payload);
  return response.data;
}

export async function updateFileManagerEntry(
  api: AxiosInstance,
  entryId: string,
  payload: {
    name?: string;
    tags?: string[];
    isStarred?: boolean;
    mimeType?: string;
  }
): Promise<FileManagerEntry> {
  const response = await api.patch<FileManagerEntry>(`/api/v1/file-manager/entries/${entryId}`, payload);
  return response.data;
}

export async function moveFileManagerEntry(
  api: AxiosInstance,
  entryId: string,
  payload: { targetParentId?: string | null }
): Promise<FileManagerEntry> {
  const response = await api.post<FileManagerEntry>(`/api/v1/file-manager/entries/${entryId}/move`, payload);
  return response.data;
}

export async function transitionFileManagerEntry(
  api: AxiosInstance,
  entryId: string,
  payload: { to: "active" | "trashed" }
): Promise<FileManagerEntry> {
  const response = await api.post<FileManagerEntry>(`/api/v1/file-manager/entries/${entryId}/transition`, payload);
  return response.data;
}

export async function deleteFileManagerEntry(api: AxiosInstance, entryId: string): Promise<void> {
  await api.delete(`/api/v1/file-manager/entries/${entryId}`);
}

export async function getFileManagerInsights(api: AxiosInstance): Promise<FileManagerInsights> {
  const response = await api.get<FileManagerInsights>("/api/v1/file-manager/insights");
  return response.data;
}
