import axios from 'axios';
import { Preferences } from '@capacitor/preferences';

const TOKEN_KEY = 'fika_token';
// Note: Refresh Token is handled automatically via HttpOnly Cookies by the backend

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  withCredentials: true, // Crucial for sending/receiving secure cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add Interceptor for Auth Token
api.interceptors.request.use(
  async (config) => {
    const { value: token } = await Preferences.get({ key: TOKEN_KEY });
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor for Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // We use a separate axios instance or direct call to avoid interceptor loop
        // The backend expects the refreshToken in a Cookie (HttpOnly), not in the body.
        const { data } = await axios.post('http://localhost:8080/api/v1/auth/refresh-token', {}, {
          withCredentials: true // Important to send the refreshToken cookie
        });

        const newToken = data.token;
        // The new Refresh Token will be set automatically by the server in a new cookie

        await Preferences.set({ key: TOKEN_KEY, value: newToken });

        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Permanent logout if refresh fails
        await Promise.all([
            Preferences.remove({ key: TOKEN_KEY }),
            Preferences.remove({ key: 'fika_user' })
        ]);
        
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
