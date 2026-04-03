import api from '../api/client';
import { Product, Category, PagedResponse } from '../types/product';

export const ProductService = {
  getAll: async (page = 0, size = 10): Promise<PagedResponse<Product>> => {
    const response = await api.get<PagedResponse<Product>>(`/products?page=${page}&size=${size}`);
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  getByCategory: async (category: string): Promise<Product[]> => {
    const response = await api.get<Product[]>(`/products/category/${category}`);
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/products/categories');
    return response.data;
  }
};

export default ProductService;
