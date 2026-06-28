import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth-store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Queue to hold requests while refreshing token
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Access Token from Zustand store in-memory state
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch auth errors and run token refresh cycles
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (!error.response) {
      console.error('API Network Error (No response received):', error.request);
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const isTokenExpired =
      status === 401 &&
      data &&
      typeof data === 'object' &&
      (data as Record<string, unknown>).message === 'ACCESS_TOKEN_EXPIRED';

    if (isTokenExpired && !originalRequest._retry) {
      if (isRefreshing) {
        // Enqueue request while another request is executing refresh
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint, passing cookies (httpOnly refresh token)
        const refreshResponse = await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { success, data: responseData } = refreshResponse.data;

        if (success && responseData) {
          const { user, accessToken } = responseData;
          
          // Update Zustand store
          useAuthStore.getState().setSession(user, accessToken);
          
          // Process queued requests
          processQueue(null, accessToken);
          
          // Retry original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return api(originalRequest);
        } else {
          throw new Error('Refresh response body malformed');
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        
        // Clear auth store session (logs user out)
        useAuthStore.getState().clearSession();
        
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { api };
export type { AxiosError };
export type { InternalAxiosRequestConfig };
