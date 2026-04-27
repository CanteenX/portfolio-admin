import type { LoginRequest, LoginResponse, SessionBootstrapResponse } from "@admin-platform/shared-types";
import type { AxiosInstance } from "axios";

export async function login(api: AxiosInstance, payload: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/api/v1/auth/login", payload);
  return response.data;
}

export async function getSessionBootstrap(api: AxiosInstance): Promise<SessionBootstrapResponse> {
  const response = await api.get<SessionBootstrapResponse>("/api/v1/system/session-bootstrap");
  return response.data;
}
