import axios from "axios";

/**
 * Called when the server rejects our token. The app registers a handler that
 * clears the session and routes to /login — without it every screen renders its
 * own generic error and the user has no way to recover short of guessing the
 * login URL.
 */
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export function createApiClient(baseURL: string, getToken: () => string | null) {
  const api = axios.create({
    baseURL,
    timeout: 15000
  });

  api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // 403 is deliberately NOT handled here: it means "authenticated but not
      // permitted", which the screen should show, not log the user out over.
      if (error?.response?.status === 401) {
        onUnauthorized?.();
      }
      return Promise.reject(error);
    }
  );

  return api;
}
