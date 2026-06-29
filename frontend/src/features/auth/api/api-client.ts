import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

/**
 * In-memory storage for the short-lived JWT Access Token.
 * Storing this in memory rather than localStorage prevents XSS extraction.
 */
let memoryToken: string | null = null;

/**
 * Global setter to update the in-memory access token.
 */
export const setAccessToken = (token: string | null) => {
  memoryToken = token;
};

/**
 * Global getter to inspect the in-memory access token.
 */
export const getAccessToken = (): string | null => {
  return memoryToken;
};

/**
 * Callback event listeners for when token refresh finishes.
 */
type RefreshCallback = (token: string) => void;
type ErrorCallback = (error: unknown) => void;

let isRefreshing = false;
let refreshSubscribers: { resolve: RefreshCallback; reject: ErrorCallback }[] = [];

/**
 * Subscribe a request to wait for the ongoing token refresh cycle.
 */
const subscribeTokenRefresh = (resolve: RefreshCallback, reject: ErrorCallback) => {
  refreshSubscribers.push({ resolve, reject });
};

/**
 * Fire queued requests once the refresh cycle finishes.
 */
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((sub) => sub.resolve(token));
  refreshSubscribers = [];
};

/**
 * Reject queued requests if the refresh cycle fails.
 */
const onRefreshFailed = (error: unknown) => {
  refreshSubscribers.forEach((sub) => sub.reject(error));
  refreshSubscribers = [];
};

/**
 * Modular Axios Instance for Authentication API integrations.
 */
export const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach the current Access Token if stored in memory
authApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (memoryToken && config.headers) {
      config.headers.Authorization = `Bearer ${memoryToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 token expirations and perform transparent token refreshes
authApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response) {
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const isTokenExpired =
      status === 401 &&
      data &&
      typeof data === 'object' &&
      (data as Record<string, unknown>).message === 'ACCESS_TOKEN_EXPIRED';

    if (isTokenExpired && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue this request until the ongoing refresh finishes
        return new Promise<string>((resolve, reject) => {
          subscribeTokenRefresh(resolve, reject);
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return authApi(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Send a POST request to refresh the token (cookies will be passed automatically)
        const refreshResponse = await axios.post(
          `${authApi.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { success, data: responseData } = refreshResponse.data;

        if (success && responseData) {
          const { accessToken } = responseData;

          // Update the local in-memory token state
          setAccessToken(accessToken);

          // Retry all queued requests with the new token
          onRefreshed(accessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return authApi(originalRequest);
        } else {
          throw new Error('Refresh response format invalid.');
        }
      } catch (refreshErr) {
        onRefreshFailed(refreshErr);
        setAccessToken(null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
export default authApi;
