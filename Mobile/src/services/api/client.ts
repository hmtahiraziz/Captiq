import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from '../../config/env';
import type { ApiErrorBody, ApiResponse } from '../../types/api';
import { clearTokens, getTokens, saveTokens } from '../../lib/storage/tokenStorage';

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

function resolveRefreshQueue(token: string | null) {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
}

apiClient.interceptors.request.use(async (config) => {
  const tokens = await getTokens();

  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const tokens = await getTokens();

      if (!tokens?.refreshToken) {
        await clearTokens();
        resolveRefreshQueue(null);
        return Promise.reject(error);
      }

      const { data } = await axios.post<ApiResponse<{
        accessToken: string;
        refreshToken: string;
      }>>(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: tokens.refreshToken,
      });

      if (!data.success) {
        await clearTokens();
        resolveRefreshQueue(null);
        return Promise.reject(error);
      }

      await saveTokens({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });

      resolveRefreshQueue(data.data.accessToken);
      originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      await clearTokens();
      resolveRefreshQueue(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.error?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
}

export async function unwrapApi<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise;

  if (!data.success) {
    throw new ApiClientError(data.error.message, undefined, data.error.code);
  }

  return data.data;
}
