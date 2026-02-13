import api from './client';
import { User, LoginResponse } from '@/types/auth';

const AuthService = {
    login: async (credentials: Record<string, string>): Promise<LoginResponse> => {
        const { data } = await api.post<LoginResponse>('/auth/login', credentials);
        if (data.token) {
            localStorage.setItem('accessToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    },

    register: async (userData: Record<string, string>): Promise<LoginResponse> => {
        const { data } = await api.post<LoginResponse>('/auth/register', userData);
        if (data.token) {
            localStorage.setItem('accessToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
        return data;
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    },

    getCurrentUser: (): User | null => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: (): boolean => {
        return !!localStorage.getItem('accessToken');
    }
};

export default AuthService;
