import { useAuth } from "../../core/auth/AuthContext";

export function usePermission(menu, action) {
  const { session } = useAuth();
  if (!session) return false;
  if (session.user?.role === "super_admin") return true;
  const allowed = session.rbacPermissions?.[menu] ?? [];
  return allowed.includes(action);
}

/**
 * Renders children only if the current user has the given action on the given menu URL.
 * Super admins always pass. Falls back to `fallback` (default: null) if denied.
 *
 * @param {{ menu: string, action: string, children: React.ReactNode, fallback?: React.ReactNode }} props
 */
export function RequirePermission({ menu, action, children, fallback = null }) {
  const allowed = usePermission(menu, action);
  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
