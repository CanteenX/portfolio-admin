import type { UIFeatureFlags } from "@admin-platform/shared-types";
import type { AxiosInstance } from "axios";

export async function getUIFeatureFlags(
  api: AxiosInstance
): Promise<UIFeatureFlags> {
  const response = await api.get<UIFeatureFlags>(
    "/api/v1/system/ui-feature-flags"
  );
  return response.data;
}

export async function updateUIFeatureFlags(
  api: AxiosInstance,
  flags: Partial<UIFeatureFlags>
): Promise<UIFeatureFlags> {
  const response = await api.put<UIFeatureFlags>(
    "/api/v1/system/ui-feature-flags",
    { flags }
  );
  return response.data;
}
