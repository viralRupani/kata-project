import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? '/api';

/**
 * Access token lives only in module memory (never localStorage), so an XSS payload
 * can't exfiltrate a persisted token. It is re-hydrated on load via silent refresh.
 */
let accessToken: string | null = null;
export const setAccessToken = (token: string | null): void => {
  accessToken = token;
};
export const getAccessToken = (): string | null => accessToken;

export const api = axios.create({
  baseURL,
  withCredentials: true, // send the refresh cookie
});

// Attach the in-memory access token to every request.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// De-duplicate concurrent refreshes into a single in-flight request.
let refreshing: Promise<string | null> | null = null;

/** Exchanges the refresh cookie for a fresh access token. Returns null on failure. */
export const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshing) {
    refreshing = axios
      .post<{ accessToken: string }>(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
      .then((res) => {
        setAccessToken(res.data.accessToken);
        return res.data.accessToken;
      })
      .catch(() => {
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
};

// On a 401, try one silent refresh + retry before surfacing the error.
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const isAuthCall = original?.url?.includes('/auth/');

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
    }
    return Promise.reject(error);
  },
);
