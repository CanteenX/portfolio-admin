import type {
  CreateModuleRecordPayload,
  ListModuleRecordsResponse,
  ModuleKey,
  ModuleRecord,
  UpdateModuleRecordPayload
} from "@admin-platform/shared-types";
import type { AxiosInstance } from "axios";

type ListParams = {
  page?: number;
  limit?: number;
};

export async function listModuleRecords(
  api: AxiosInstance,
  moduleKey: ModuleKey,
  params: ListParams = {}
): Promise<ListModuleRecordsResponse> {
  const response = await api.get<ListModuleRecordsResponse>(`/api/v1/${moduleKey}/items`, {
    params
  });
  return response.data;
}

export async function createModuleRecord(
  api: AxiosInstance,
  moduleKey: ModuleKey,
  payload: CreateModuleRecordPayload
): Promise<ModuleRecord> {
  const response = await api.post<ModuleRecord>(`/api/v1/${moduleKey}/items`, payload);
  return response.data;
}

export async function updateModuleRecord(
  api: AxiosInstance,
  moduleKey: ModuleKey,
  id: string,
  payload: UpdateModuleRecordPayload
): Promise<ModuleRecord> {
  const response = await api.put<ModuleRecord>(`/api/v1/${moduleKey}/items/${id}`, payload);
  return response.data;
}

export async function deleteModuleRecord(api: AxiosInstance, moduleKey: ModuleKey, id: string): Promise<void> {
  await api.delete(`/api/v1/${moduleKey}/items/${id}`);
}
