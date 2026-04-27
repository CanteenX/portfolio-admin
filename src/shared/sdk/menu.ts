import type {
  MenuGroup,
  MenuItem,
  MenuPermissionEntry,
  QuickLink,
} from "@admin-platform/shared-types";
import type { AxiosInstance } from "axios";

// ── Menu Groups ────────────────────────────────────────────────────

export async function getMenuGroups(
  api: AxiosInstance
): Promise<MenuGroup[]> {
  const response = await api.get<{ groups: MenuGroup[] }>(
    "/api/v1/menus/groups"
  );
  return response.data.groups;
}

export async function createMenuGroup(
  api: AxiosInstance,
  payload: {
    name: string;
    slug: string;
    order: number;
    isLink: boolean;
    route?: string;
    icon?: string;
  }
): Promise<MenuGroup> {
  const response = await api.post<MenuGroup>("/api/v1/menus/groups", payload);
  return response.data;
}

export async function updateMenuGroup(
  api: AxiosInstance,
  id: string,
  payload: Partial<{
    name: string;
    slug: string;
    order: number;
    isLink: boolean;
    route: string;
    icon: string;
  }>
): Promise<MenuGroup> {
  const response = await api.put<MenuGroup>(
    `/api/v1/menus/groups/${id}`,
    payload
  );
  return response.data;
}

export async function deleteMenuGroup(
  api: AxiosInstance,
  id: string
): Promise<void> {
  await api.delete(`/api/v1/menus/groups/${id}`);
}

export async function reorderMenuGroup(
  api: AxiosInstance,
  id: string,
  order: number
): Promise<void> {
  await api.patch(`/api/v1/menus/groups/${id}/reorder`, { order });
}

// ── Menu Items ─────────────────────────────────────────────────────

export async function createMenuItem(
  api: AxiosInstance,
  payload: {
    groupId: string;
    name: string;
    slug: string;
    route: string;
    icon: string;
    parentId?: string | null;
    order: number;
    isParent: boolean;
  }
): Promise<MenuItem> {
  const response = await api.post<MenuItem>("/api/v1/menus/items", payload);
  return response.data;
}

export async function updateMenuItem(
  api: AxiosInstance,
  id: string,
  payload: Partial<{
    name: string;
    slug: string;
    route: string;
    icon: string;
    parentId: string | null;
    order: number;
    isParent: boolean;
  }>
): Promise<MenuItem> {
  const response = await api.put<MenuItem>(
    `/api/v1/menus/items/${id}`,
    payload
  );
  return response.data;
}

export async function deleteMenuItem(
  api: AxiosInstance,
  id: string
): Promise<void> {
  await api.delete(`/api/v1/menus/items/${id}`);
}

export async function reorderMenuItem(
  api: AxiosInstance,
  id: string,
  order: number
): Promise<void> {
  await api.patch(`/api/v1/menus/items/${id}/reorder`, { order });
}

// ── Structured Permissions ─────────────────────────────────────────

export async function getRoleStructuredPermissions(
  api: AxiosInstance,
  roleId: string
): Promise<MenuPermissionEntry[]> {
  const response = await api.get<{ permissions: MenuPermissionEntry[] }>(
    `/api/v1/system/custom-roles/${roleId}/permissions`
  );
  return response.data.permissions;
}

export async function updateRoleStructuredPermissions(
  api: AxiosInstance,
  roleId: string,
  permissions: MenuPermissionEntry[]
): Promise<void> {
  await api.put(`/api/v1/system/custom-roles/${roleId}/permissions`, {
    permissions,
  });
}

// ── Quick Links ────────────────────────────────────────────────────

export async function getQuickLinks(
  api: AxiosInstance
): Promise<QuickLink[]> {
  const response = await api.get<{ links: QuickLink[] }>(
    "/api/v1/system/quick-links"
  );
  return response.data.links;
}

export async function createQuickLink(
  api: AxiosInstance,
  payload: { name: string; url: string; iconUrl?: string; order: number }
): Promise<QuickLink> {
  const response = await api.post<QuickLink>(
    "/api/v1/system/quick-links",
    payload
  );
  return response.data;
}

export async function updateQuickLink(
  api: AxiosInstance,
  id: string,
  payload: Partial<{ name: string; url: string; iconUrl: string; order: number }>
): Promise<QuickLink> {
  const response = await api.put<QuickLink>(
    `/api/v1/system/quick-links/${id}`,
    payload
  );
  return response.data;
}

export async function deleteQuickLink(
  api: AxiosInstance,
  id: string
): Promise<void> {
  await api.delete(`/api/v1/system/quick-links/${id}`);
}
