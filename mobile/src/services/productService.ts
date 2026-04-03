import api from '../api/client';
import { Product, Category, PagedResponse } from '../types/product';

export interface ProductFilters {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  onlyAvailable?: boolean;
  page?: number;
  size?: number;
}

export const ProductService = {
  // Récupérer les produits avec pagination et filtres consolidés
  getAll: async (filters: ProductFilters = {}): Promise<PagedResponse<Product>> => {
    const params = new URLSearchParams();
    if (filters.name) params.append('name', filters.name);
    if (filters.category) params.append('category', filters.category);
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.onlyAvailable !== undefined) params.append('onlyAvailable', filters.onlyAvailable.toString());
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());

    const response = await api.get<PagedResponse<Product>>(`/products`, { params });
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  // Obsolète: On préfère désormais passer la catégorie en paramètre à getAll pour combiner avec la recherche
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
