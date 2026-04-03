import api from '../api/client';
import { AuthResponse, LoginCredentials, RegisterData } from '../types/auth';

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('fika_token', response.data.token);
      localStorage.setItem('fika_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('fika_token');
    localStorage.removeItem('fika_user');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('fika_user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('fika_token');
  }
};

export default AuthService;
