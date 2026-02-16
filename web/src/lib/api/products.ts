import api from '@/lib/api/client';
import { 
  CreateProductRequest, 
  Product, 
  UpdateProductRequest, 
  ProductFilters, 
  PagedResponse,
  Category,
  StockUpdateRequest 
} from '@/types/product';

const PRODUCT_API_BASE = '/products';

export const ProductService = {
  // Récupérer les produits avec pagination et filtres
  getAll: async (filters: ProductFilters = {}): Promise<PagedResponse<Product>> => {
    try {
      const params = new URLSearchParams();
      if (filters.name) params.append('name', filters.name);
      if (filters.category) params.append('category', filters.category);
      if (filters.excludedAllergen) params.append('excludedAllergen', filters.excludedAllergen);
      if (filters.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.onlyAvailable) params.append('onlyAvailable', filters.onlyAvailable.toString());
      if (filters.page !== undefined) params.append('page', filters.page.toString());
      if (filters.size !== undefined) params.append('size', filters.size.toString());
      if (filters.sort) params.append('sort', filters.sort);

      const response = await api.get<PagedResponse<Product>>(`${PRODUCT_API_BASE}`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Récupérer un produit par ID
  getById: async (id: string): Promise<Product> => {
    try {
      const response = await api.get<Product>(`${PRODUCT_API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Créer un nouveau produit
  create: async (product: CreateProductRequest): Promise<Product> => {
    try {
      const response = await api.post<Product>(PRODUCT_API_BASE, product);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Mettre à jour un produit existant
  update: async (id: string, product: UpdateProductRequest): Promise<Product> => {
    try {
      const response = await api.put<Product>(`${PRODUCT_API_BASE}/${id}`, product);
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  // Supprimer un produit
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${PRODUCT_API_BASE}/${id}`);
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },

  // Mettre à jour le stock
  updateStock: async (id: string, quantity: number): Promise<Product> => {
    try {
        const body: StockUpdateRequest = { quantity };
        const response = await api.patch<Product>(`${PRODUCT_API_BASE}/${id}/stock`, body);
        return response.data;
    } catch (error) {
        console.error(`Error updating stock for product ${id}:`, error);
        throw error;
    }
  },

  // Récupérer toutes les catégories
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get<Category[]>(`${PRODUCT_API_BASE}/categories`);
      return response.data;
    } catch (error) {
       console.error('Error fetching categories:', error);
       throw error;
    }
  }
};

export default ProductService;
