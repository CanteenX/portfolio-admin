import type { ApiManagementKey, ApiManagementKeyAuditEvent } from "@admin-platform/shared-types";
import type { AxiosInstance } from "axios";

export async function listApiManagementKeys(api: AxiosInstance): Promise<ApiManagementKey[]> {
  const response = await api.get<{ items: ApiManagementKey[] }>("/api/v1/api-management/keys");
  return response.data.items;
}

export async function issueApiManagementKey(
  api: AxiosInstance,
  payload: {
    name: string;
    description?: string;
    scopes?: string[];
    expiresAt?: string;
  }
): Promise<{ key: ApiManagementKey; plaintextKey: string }> {
  const response = await api.post<{ key: ApiManagementKey; plaintextKey: string }>("/api/v1/api-management/keys", payload);
  return response.data;
}

export async function revokeApiManagementKey(
  api: AxiosInstance,
  keyId: string,
  payload: { reason?: string } = {}
): Promise<ApiManagementKey> {
  const response = await api.post<ApiManagementKey>(`/api/v1/api-management/keys/${keyId}/revoke`, payload);
  return response.data;
}

export async function regenerateApiManagementKey(
  api: AxiosInstance,
  keyId: string,
  payload: {
    name?: string;
    description?: string;
    scopes?: string[];
    expiresAt?: string;
  } = {}
): Promise<{ key: ApiManagementKey; plaintextKey: string }> {
  const response = await api.post<{ key: ApiManagementKey; plaintextKey: string }>(
    `/api/v1/api-management/keys/${keyId}/regenerate`,
    payload
  );
  return response.data;
}

export async function listApiManagementKeyEvents(
  api: AxiosInstance,
  keyId: string
): Promise<ApiManagementKeyAuditEvent[]> {
  const response = await api.get<{ items: ApiManagementKeyAuditEvent[] }>(`/api/v1/api-management/keys/${keyId}/events`);
  return response.data.items;
}

export async function getApiManagementInsights(api: AxiosInstance): Promise<{
  counts: { totalKeys: number; activeKeys: number; revokedKeys: number; expiringSoon: number };
}> {
  const response = await api.get<{
    counts: { totalKeys: number; activeKeys: number; revokedKeys: number; expiringSoon: number };
  }>("/api/v1/api-management/insights");
  return response.data;
}
