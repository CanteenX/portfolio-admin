import { canAccessRoute } from "@admin-platform/shared-rbac";

export function hasRouteAccess({ role, permissions, features, moduleKey, requiredPermissions = [] }) {
  return canAccessRoute({
    role,
    permissions: new Set(permissions),
    features,
    moduleKey,
    requiredPermissions
  });
}
