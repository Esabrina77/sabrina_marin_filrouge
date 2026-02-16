import api from '@/lib/api/client';
import { PagedResponse } from '@/types/product';
import { User, UserFilters, UserRequest } from '@/types/user';

const USER_API_BASE = '/users';

export const UserService = {
  // Récupérer tous les utilisateurs
  getAll: async (filters: UserFilters = {}): Promise<PagedResponse<User>> => {
    try {
      const params = new URLSearchParams();
      if (filters.page !== undefined) params.append('page', filters.page.toString());
      if (filters.size !== undefined) params.append('size', filters.size.toString());
      if (filters.sort) params.append('sort', filters.sort);

      const response = await api.get<PagedResponse<User>>(USER_API_BASE, { params });
      return response.data;
    } catch (error) {
       console.error('Error fetching users:', error);
       throw error;
    }
  },

  // Récupérer un utilisateur par ID
  getById: async (id: string): Promise<User> => {
    try {
      const response = await api.get<User>(`${USER_API_BASE}/${id}`);
      return response.data;
    } catch (error) {
       console.error(`Error fetching user ${id}:`, error);
       throw error;
    }
  },

  // Créer un utilisateur (Admin only)
  create: async (user: UserRequest): Promise<User> => {
    try {
      const response = await api.post<User>(USER_API_BASE, user);
      return response.data;
    } catch (error) {
       console.error('Error creating user:', error);
       throw error;
    }
  },

  // Mettre à jour un utilisateur
  update: async (id: string, user: UserRequest): Promise<User> => {
    try {
      const response = await api.put<User>(`${USER_API_BASE}/${id}`, user);
      return response.data;
    } catch (error) {
       console.error(`Error updating user ${id}:`, error);
       throw error;
    }
  },

  // Supprimer un utilisateur
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${USER_API_BASE}/${id}`);
    } catch (error) {
       console.error(`Error deleting user ${id}:`, error);
       throw error;
    }
  },

  // Promouvoir en Admin
  setAdminRole: async (id: string): Promise<void> => {
    try {
      await api.put(`${USER_API_BASE}/admin/${id}`);
    } catch (error) {
       console.error(`Error promoting user ${id}:`, error);
       throw error;
    }
  }
};

export default UserService;
