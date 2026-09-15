import { useLocation } from "react-router-dom";
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

/**
 * Resolves the permissions for the page currently being viewed, so a screen can
 * gate its own buttons without repeating its own menu URL at every call site
 * (and without the two drifting when a route is renamed).
 *
 * Longest-prefix match, matching PermissionProtected, so a detail route such as
 * /rbac/roles/123/edit resolves to the /rbac/roles grant.
 */
export function useRbacPagePermissions() {
  const { session } = useAuth();
  const location = useLocation();

  if (session?.user?.role === "super_admin") {
    return { read: true, write: true, edit: true, delete: true, print: true, mail: true };
  }

  const permissions = session?.rbacPermissions ?? {};
  const path = location.pathname.split("?")[0].replace(/\/+$/, "") || "/";
  const menuUrl =
    permissions[path] !== undefined
      ? path
      : Object.keys(permissions)
          .filter((url) => path === url || path.startsWith(`${url}/`))
          .sort((a, b) => b.length - a.length)[0];

  const granted = menuUrl ? permissions[menuUrl] ?? [] : [];
  return {
    read: granted.includes("read"),
    write: granted.includes("write"),
    edit: granted.includes("edit"),
    delete: granted.includes("delete"),
    print: granted.includes("print"),
    mail: granted.includes("mail")
  };
}

/**
 * Renders children only if the current page grants `action`.
 *
 * This is presentation only — the server re-checks every request — so its job
 * is to stop offering an action that is about to 403.
 *
 * @param {{ action: string, children: React.ReactNode, fallback?: React.ReactNode }} props
 */
export function RbacGate({ action, children, fallback = null }) {
  const permissions = useRbacPagePermissions();
  return permissions[action] ? <>{children}</> : <>{fallback}</>;
}
