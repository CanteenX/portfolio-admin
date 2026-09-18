import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createApiClient, getSessionBootstrap, login as loginRequest, setUnauthorizedHandler } from "@admin-platform/shared-sdk";

const TOKEN_KEY = "admin_platform_token";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ?? "http://localhost:7002";

const AuthContext = createContext(null);

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
      // Bootstrap is the single source of the session, RBAC snapshot included.
      //
      // This used to run a second request to /auth/user/me in parallel and
      // spread its result LAST. That call swallowed every error and returned
      // rbacAllowedMenus: [] — so any failure of a redundant request overwrote
      // the menus bootstrap had already delivered, and the sidebar showed
      // "No menus assigned" to a super admin holding all 82. Both endpoints
      // build the same snapshot server-side, so the second call bought nothing
      // except a way to lose data it duplicated.
      setSession(await getSessionBootstrap(api));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [api, logout, token]);

  // Deliberately does NOT set the global `loading` flag.
  //
  // App renders a full-screen spinner while `loading` is true, which unmounts
  // the entire route tree — LoginPage included. Setting it here meant a failed
  // login caught its error on a component that no longer existed, React
  // discarded the setError, and the page remounted blank: no message, just a
  // form that had seemingly done nothing. LoginPage owns its own `submitting`
  // state for the button. On success, setToken triggers refreshSession, which
  // legitimately shows the spinner while the session loads.
  const login = useCallback(
    async (payload) => {
      const response = await loginRequest(api, payload);
      localStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
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
