import api, { setAccessToken } from './client';
import { User, LoginResponse, TokenRefreshResponse } from '@/types/auth';

const AuthService = {
    login: async (credentials: Record<string, string>): Promise<LoginResponse> => {
        const { data } = await api.post<LoginResponse>('/auth/login', credentials);
        if (data.token) {
            setAccessToken(data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    },

    register: async (userData: Record<string, string>): Promise<LoginResponse> => {
        const { data } = await api.post<LoginResponse>('/auth/register', userData);
        if (data.token) {
            setAccessToken(data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            setAccessToken(null);
            localStorage.removeItem('user');
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
    },

    // Silent Refresh: Automatically restores the session from the HttpOnly Cookie on page reload
    silentRefresh: async (): Promise<string | null> => {
        try {
            const { data } = await api.post<TokenRefreshResponse>('/auth/refresh-token');
            if (data.accessToken) {
                setAccessToken(data.accessToken);
                return data.accessToken;
            }
        } catch (error) {
            console.warn('Silent refresh failed - probably unauthenticated');
            setAccessToken(null);
        }
        return null;
    },

    getCurrentUser: (): User | null => {
        if (typeof window === 'undefined') return null;
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: (): boolean => {
        return !!AuthService.getCurrentUser();
    }
};

export default AuthService;
