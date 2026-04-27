import type { FeatureFlags, ModuleKey } from "@admin-platform/shared-types";
import type { AxiosInstance } from "axios";

export async function getFeatureConfig(api: AxiosInstance): Promise<FeatureFlags> {
  const response = await api.get<{ features: FeatureFlags }>("/api/v1/system/feature-config");
  return response.data.features;
}

export async function updateFeatureConfig(
  api: AxiosInstance,
  enabledModules: ModuleKey[]
): Promise<FeatureFlags> {
  const response = await api.put<{ features: FeatureFlags }>("/api/v1/system/feature-config", {
    enabledModules
  });
  return response.data.features;
}

export type PaymentProviderSettings = {
  id: string;
  displayName: string;
  configured: boolean;
  webhookPath: string;
};

export type PaymentSettingsResponse = {
  providers: PaymentProviderSettings[];
  defaultSuccessUrl: string;
  defaultCancelUrl: string;
  allowedRedirectOrigins: string[];
  paypalMode: string;
};

export async function getPaymentSettings(
  api: AxiosInstance
): Promise<PaymentSettingsResponse> {
  const response = await api.get<PaymentSettingsResponse>("/api/v1/system/payment-settings");
  return response.data;
}

// ── Dashboard KPIs ──────────────────────────────────────────────

export type DashboardKpis = {
  openTickets: number;
  activeTasks: number;
  todayEvents: number;
  openDeals: number;
  pipelineValue: number;
  openJobs: number;
  pendingApplications: number;
};

export async function getDashboardKpis(
  api: AxiosInstance
): Promise<DashboardKpis> {
  const response = await api.get<DashboardKpis>("/api/v1/system/dashboard-kpis");
  return response.data;
}

// ── Audit Log ───────────────────────────────────────────────────

export type AuditLogEntry = {
  _id: string;
  action: string;
  entity: string;
  entityId?: string;
  userId: string;
  userEmail?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type AuditLogResponse = {
  items: AuditLogEntry[];
  total: number;
};

export async function getAuditLog(
  api: AxiosInstance,
  params?: { entity?: string; limit?: number; offset?: number }
): Promise<AuditLogResponse> {
  const response = await api.get<AuditLogResponse>("/api/v1/system/audit-log", {
    params,
  });
  return response.data;
}

// ── System Settings ─────────────────────────────────────────────

export type SystemSettings = {
  timezone: string;
  defaultCurrency: string;
  locale: string;
};

export async function getSystemSettings(
  api: AxiosInstance
): Promise<SystemSettings> {
  const response = await api.get<SystemSettings>("/api/v1/system/settings");
  return response.data;
}

export async function updateSystemSettings(
  api: AxiosInstance,
  payload: SystemSettings
): Promise<SystemSettings> {
  const response = await api.put<SystemSettings>("/api/v1/system/settings", payload);
  return response.data;
}

// ── Global Search ───────────────────────────────────────────────

export type SearchResult = {
  module: string;
  id: string;
  label: string;
};

export type SearchResponse = {
  results: SearchResult[];
};

export async function globalSearch(
  api: AxiosInstance,
  query: string
): Promise<SearchResponse> {
  const response = await api.get<SearchResponse>("/api/v1/system/search", {
    params: { q: query },
  });
  return response.data;
}

// ── CSV Export ──────────────────────────────────────────────────

export function getExportUrl(moduleKey: string): string {
  return `/api/v1/system/export/${moduleKey}`;
}

// ── Branding ───────────────────────────────────────────────────

export type Branding = {
  companyName: string;
  logoUrl: string;
  primaryColor: string;
};

export async function getBranding(api: AxiosInstance): Promise<Branding> {
  const response = await api.get<Branding>("/api/v1/system/branding");
  return response.data;
}

export async function updateBranding(
  api: AxiosInstance,
  payload: Branding
): Promise<Branding> {
  const response = await api.put<Branding>("/api/v1/system/branding", payload);
  return response.data;
}

// ── Custom Roles ───────────────────────────────────────────────

export type CustomRole = {
  id: string;
  name: string;
  permissions: string[];
};

export async function getCustomRoles(
  api: AxiosInstance
): Promise<CustomRole[]> {
  const response = await api.get<{ roles: CustomRole[] }>("/api/v1/system/custom-roles");
  return response.data.roles;
}

export async function createCustomRole(
  api: AxiosInstance,
  payload: { name: string; permissions: string[] }
): Promise<CustomRole> {
  const response = await api.post<CustomRole>("/api/v1/system/custom-roles", payload);
  return response.data;
}

export async function updateCustomRole(
  api: AxiosInstance,
  id: string,
  payload: { name: string; permissions: string[] }
): Promise<CustomRole> {
  const response = await api.put<CustomRole>(`/api/v1/system/custom-roles/${id}`, payload);
  return response.data;
}

export async function deleteCustomRole(
  api: AxiosInstance,
  id: string
): Promise<void> {
  await api.delete(`/api/v1/system/custom-roles/${id}`);
}

export async function assignCustomRole(
  api: AxiosInstance,
  userId: string,
  customRoleId: string | null
): Promise<void> {
  await api.put(`/api/v1/system/users/${userId}/custom-role`, { customRoleId });
}

// ── User Management ───────────────────────────────────────────

export type UserRecord = {
  _id: string;
  email: string;
  role: "super_admin" | "admin";
  customRoleId?: string;
  createdAt: string;
  updatedAt: string;
};

export async function getUsers(api: AxiosInstance): Promise<UserRecord[]> {
  const response = await api.get<{ users: UserRecord[] }>("/api/v1/system/users");
  return response.data.users;
}

export async function createUser(
  api: AxiosInstance,
  payload: { email: string; password: string; role: "super_admin" | "admin" }
): Promise<UserRecord> {
  const response = await api.post<UserRecord>("/api/v1/system/users", payload);
  return response.data;
}

export async function updateUser(
  api: AxiosInstance,
  userId: string,
  payload: { email?: string; password?: string; role?: "super_admin" | "admin" }
): Promise<UserRecord> {
  const response = await api.put<UserRecord>(`/api/v1/system/users/${userId}`, payload);
  return response.data;
}

export async function deleteUser(
  api: AxiosInstance,
  userId: string
): Promise<void> {
  await api.delete(`/api/v1/system/users/${userId}`);
}

// ── Notifications ──────────────────────────────────────────────

export type Notification = {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: string;
};

export type NotificationsResponse = {
  items: Notification[];
  total: number;
};

export async function getNotifications(
  api: AxiosInstance,
  params?: { limit?: number; offset?: number }
): Promise<NotificationsResponse> {
  const response = await api.get<NotificationsResponse>("/api/v1/system/notifications", { params });
  return response.data;
}

export async function getUnreadCount(
  api: AxiosInstance
): Promise<number> {
  const response = await api.get<{ unreadCount: number }>("/api/v1/system/notifications/unread-count");
  return response.data.unreadCount;
}

export async function markNotificationRead(
  api: AxiosInstance,
  id: string
): Promise<void> {
  await api.patch(`/api/v1/system/notifications/${id}/read`);
}

export async function markAllNotificationsRead(
  api: AxiosInstance
): Promise<number> {
  const response = await api.post<{ marked: number }>("/api/v1/system/notifications/mark-all-read");
  return response.data.marked;
}

// ── GDPR Export ────────────────────────────────────────────────

export type GdprExportBundle = {
  exportedAt: string;
  user: Record<string, unknown> | null;
  supportTickets: unknown[];
  tasks: unknown[];
  calendarEvents: unknown[];
  todoItems: unknown[];
  projects: unknown[];
  crmContacts: unknown[];
  crmDeals: unknown[];
};

export async function getGdprExport(
  api: AxiosInstance
): Promise<GdprExportBundle> {
  const response = await api.get<GdprExportBundle>("/api/v1/system/gdpr-export");
  return response.data;
}

// ── CSV Import ─────────────────────────────────────────────────

export type CsvImportResult = {
  imported: number;
  errors: Array<{ row: number; message: string }>;
};

export async function importCsv(
  api: AxiosInstance,
  moduleKey: string,
  csv: string
): Promise<CsvImportResult> {
  const response = await api.post<CsvImportResult>(`/api/v1/system/import/${moduleKey}`, { csv });
  return response.data;
}
