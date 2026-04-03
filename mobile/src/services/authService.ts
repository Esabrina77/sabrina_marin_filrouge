import { Preferences } from '@capacitor/preferences';
import api from '../api/client';
import { AuthResponse, LoginCredentials, RegisterData } from '../types/auth';

const TOKEN_KEY = 'fika_token';
const USER_KEY = 'fika_user';

export const AuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      await AuthService.saveAuthData(response.data);
    }
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      await AuthService.saveAuthData(response.data);
    }
    return response.data;
  },

  refreshToken: async (): Promise<string> => {
    // The refreshToken is sent automatically via HttpOnly Cookie by Axios (withCredentials: true)
    const response = await api.post<AuthResponse>('/auth/refresh-token');
    if (response.data.token) {
      await AuthService.saveAuthData(response.data);
      return response.data.token;
    }
    throw new Error('Refresh failed');
  },

  logout: async () => {
    try {
        await api.post('/auth/logout');
    } catch (e) {
        console.error('Logout error', e);
    } finally {
        await Promise.all([
          Preferences.remove({ key: TOKEN_KEY }),
          Preferences.remove({ key: USER_KEY })
        ]);
        window.location.href = '/login';
    }
  },

  saveAuthData: async (data: AuthResponse) => {
    await Promise.all([
      Preferences.set({ key: TOKEN_KEY, value: data.token }),
      Preferences.set({ key: USER_KEY, value: JSON.stringify(data.user) })
    ]);
  },

  getToken: async () => {
    const { value } = await Preferences.get({ key: TOKEN_KEY });
    return value;
  },

  getCurrentUser: async () => {
    const { value } = await Preferences.get({ key: USER_KEY });
    return value ? JSON.parse(value) : null;
  },

  isAuthenticated: async () => {
    const token = await AuthService.getToken();
    return !!token;
  }
};

export default AuthService;
