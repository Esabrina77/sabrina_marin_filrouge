import axios from 'axios';
import { TokenRefreshResponse } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// In-Memory Storage for Access Token (Better Security than LocalStorage)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
    accessToken = token;
};

export const getAccessToken = () => accessToken;

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor pour ajouter l'Access Token (JWT) à chaque requête
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor pour gérer l'expiration du token (401)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Appel à l'endpoint refresh-token
                // Le cookie refreshToken est envoyé automatiquement grâce à withCredentials: true
                const { data } = await axios.post<TokenRefreshResponse>(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true });
                
                if (data.accessToken) {
                    setAccessToken(data.accessToken);
                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                    return api(originalRequest);
                }
            } catch (err) {
                // Si le refresh échoue (expire lui aussi), on déconnecte
                setAccessToken(null);
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
