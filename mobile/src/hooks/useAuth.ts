import { useState, useEffect } from 'react';
import { User, LoginCredentials, RegisterData } from '../types/auth';
import AuthService from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthService.login(credentials);
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Identifiants incorrects. Veuillez réessayer.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthService.register(data);
      setUser(response.user);
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || "L'inscription a échoué. Veuillez vérifier les informations.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  return { user, loading, error, login, register, logout, isAuthenticated: !!user };
};

export default useAuth;
