import { usePagePermissions } from "../../core/menu/MenuContext";

/**
 * Conditionally renders children based on the current page's permissions.
 * @param {{ action: string, children: React.ReactNode, fallback?: React.ReactNode }} props
 */
export function PermissionGate({ action, children, fallback = null }) {
  const perms = usePagePermissions();
  return perms[action] ? <>{children}</> : <>{fallback}</>;
}
