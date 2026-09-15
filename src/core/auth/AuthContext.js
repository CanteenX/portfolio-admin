import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createApiClient, getSessionBootstrap, login as loginRequest, setUnauthorizedHandler } from "@admin-platform/shared-sdk";

const TOKEN_KEY = "admin_platform_token";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "http://localhost:7002";

const AuthContext = createContext(null);

async function fetchRbacPermissions(api) {
  try {
    const res = await api.get("/api/v1/auth/user/me");
    return {
      rbacPermissions: res.data.permissions ?? {},
      rbacAllowedMenus: res.data.allowedMenus ?? [],
      employeeId: res.data.employeeId ?? null,
      rbacRoleName: res.data.roleName ?? null,
    };
  } catch {
    return { rbacPermissions: {}, rbacAllowedMenus: [], employeeId: null, rbacRoleName: null };
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const api = useMemo(() => createApiClient(API_BASE_URL, () => token), [token]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setSession(null);
  }, []);

  const refreshSession = useCallback(async () => {
    setLoading(true);
    if (!token) {
      setSession(null);
      setLoading(false);
      return;
    }
    try {
      const [bootstrap, rbacData] = await Promise.all([
        getSessionBootstrap(api),
        fetchRbacPermissions(api),
      ]);
      setSession({ ...bootstrap, ...rbacData });
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [api, logout, token]);

  const login = useCallback(
    async (payload) => {
      setLoading(true);
      try {
        const response = await loginRequest(api, payload);
        localStorage.setItem(TOKEN_KEY, response.token);
        setToken(response.token);
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [api]
  );

  // One effect, not two. refreshSession is a useCallback keyed on token, so the
  // previous pair both re-ran on every token change and fired two concurrent
  // bootstrap requests that raced to setSession.
  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // A 401 from any request means the token is gone or expired; drop the session
  // so the app falls back to the login screen instead of failing silently.
  useEffect(() => {
    setUnauthorizedHandler(() => logout());
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo(
    () => ({
      api,
      token,
      session,
      loading,
      login,
      logout
    }),
    [api, token, session, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
