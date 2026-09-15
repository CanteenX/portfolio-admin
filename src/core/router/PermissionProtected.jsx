import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

/**
 * Route-level RBAC gate.
 *
 * Enforces that the URL being visited maps to a menu the user holds `read` on.
 * Sidebar link-hiding is NOT access control — it only removes the link, so a
 * typed URL, a bookmark or browser history still reaches the screen. This is
 * the component that actually stops that.
 *
 * It is a UI gate, not a security boundary: the server re-checks every request
 * via requireRbacPermission. Its job is to avoid showing someone a screen whose
 * every API call is about to 403.
 *
 * Resolution is synchronous during render so route changes do not flash a
 * full-screen spinner, which reads as a page refresh.
 */

/** Reachable by any authenticated user — they carry no module data of their own. */
const WHITELISTED_ROUTES = [
  "/",
  "/dashboard",
  "/profile",
  "/pages/profile",
  "/notifications",
  "/payments/callback"
];

/**
 * Template/demo surfaces inherited from the UI kit, plus error screens. They
 * render no customer data and have no MenuMaster row, so gating them would only
 * produce dead links for non-super-admins with nothing gained.
 */
const WHITELISTED_PREFIXES = ["/ui/", "/forms/", "/charts/", "/maps/", "/pages/", "/error/", "/docs"];

const normalize = (url) => url.split("?")[0].replace(/\/+$/, "") || "/";

/**
 * Longest-prefix match, so `/portfolio/projects/masters` resolves to its own
 * menu rather than to `/portfolio/projects`, and a detail route like
 * `/rbac/roles/123/edit` still resolves to `/rbac/roles`.
 */
function findMenuUrl(pathname, permissions) {
  const path = normalize(pathname);
  if (permissions[path]) return path;

  const candidates = Object.keys(permissions)
    .filter((menuUrl) => path === menuUrl || path.startsWith(`${menuUrl}/`))
    .sort((a, b) => b.length - a.length);

  return candidates[0] ?? null;
}

export function PermissionProtected({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (WHITELISTED_ROUTES.includes(normalize(location.pathname))) {
    return <>{children}</>;
  }

  // Wait for the session rather than deciding on absent data — denying here
  // would bounce every user to the dashboard on a hard refresh.
  if (loading || !session) return null;

  if (session.user?.role === "super_admin") return <>{children}</>;

  const permissions = session.rbacPermissions ?? {};
  const menuUrl = findMenuUrl(location.pathname, permissions);

  if (!menuUrl || !permissions[menuUrl]?.includes("read")) {
    return <Navigate to="/dashboard" replace state={{ deniedFrom: location.pathname }} />;
  }

  return <>{children}</>;
}

export default PermissionProtected;
