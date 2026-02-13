export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: 'ADMIN' | 'CLIENT';
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface TokenRefreshResponse {
    accessToken: string;
}

export interface ApiError {
    message: string;
    status: number;
    error: string;
}
