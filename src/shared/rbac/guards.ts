import type { FeatureFlags, ModuleKey, RoleKey } from "@admin-platform/shared-types";

export type RouteAccessInput = {
  role: RoleKey;
  permissions: Set<string>;
  features: FeatureFlags;
  moduleKey: ModuleKey;
  requiredPermissions?: string[];
};

export const isSuperAdmin = (role: RoleKey): boolean => role === "super_admin";

export const isModuleEnabled = (features: FeatureFlags, moduleKey: ModuleKey): boolean =>
  features[moduleKey] === true;

export const hasPermissions = (permissions: Set<string>, required: string[]): boolean =>
  required.every((permission) => permissions.has(permission));

export function canAccessRoute(input: RouteAccessInput): boolean {
  if (isSuperAdmin(input.role)) {
    return true;
  }

  if (!isModuleEnabled(input.features, input.moduleKey)) {
    return false;
  }

  if (!input.requiredPermissions || input.requiredPermissions.length === 0) {
    return true;
  }

  return hasPermissions(input.permissions, input.requiredPermissions);
}

export function canReadModule(
  role: RoleKey,
  permissions: Set<string>,
  features: FeatureFlags,
  moduleKey: ModuleKey
): boolean {
  return canAccessRoute({
    role,
    permissions,
    features,
    moduleKey,
    requiredPermissions: [`${moduleKey}.read`]
  });
}
