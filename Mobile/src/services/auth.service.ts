import type { AuthTokens, User } from '../types/api';
import { apiClient, unwrapApi } from './api/client';

export async function register(email: string, password: string): Promise<AuthTokens> {
  return unwrapApi(
    apiClient.post('/auth/register', { email, password }),
  );
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  return unwrapApi(
    apiClient.post('/auth/login', { email, password }),
  );
}

export async function logout(refreshToken: string): Promise<void> {
  await unwrapApi(
    apiClient.post('/auth/logout', { refreshToken }),
  );
}

export async function getMe(): Promise<User> {
  return unwrapApi(apiClient.get('/auth/me'));
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return unwrapApi(apiClient.post('/auth/forgot-password', { email }));
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<{ message: string }> {
  return unwrapApi(apiClient.post('/auth/reset-password', { token, password }));
}
