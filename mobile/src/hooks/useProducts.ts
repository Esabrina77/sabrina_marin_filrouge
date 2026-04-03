import { useState, useEffect, useCallback } from 'react';
import { Product, Category, PagedResponse } from '../types/product';
import ProductService, { ProductFilters } from '../services/productService';

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async (filters: ProductFilters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response: PagedResponse<Product> = await ProductService.getAll(filters);
            setProducts(response.content);
            return response;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des produits.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data: any = await ProductService.getCategories();
            // Transform strings into objects if needed (Backend returns Enum strings)
            const resolvedCategories: Category[] = data.map((cat: string | Category) => {
                if (typeof cat === 'string') {
                    return { id: cat, name: cat, slug: cat };
                }
                return cat;
            });
            setCategories(resolvedCategories);
            return resolvedCategories;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des catégories.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchByCategory = useCallback(async (category: string) => {
        // ... rest of the hook
        setLoading(true);
        setError(null);
        try {
            const data = await ProductService.getByCategory(category);
            setProducts(data);
            return data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors du filtrage des produits.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [productsResp, categoriesResp] = await Promise.all([
                ProductService.getAll({ size: 50 }), // Fetch a good amount for the home page
                ProductService.getCategories()
            ]);
            
            setProducts(productsResp.content);
            
            // Map strings to objects
            const resolvedCategories: Category[] = (categoriesResp as any).map((cat: string | Category) => {
                if (typeof cat === 'string') {
                    return { id: cat, name: cat, slug: cat };
                }
                return cat;
            });
            setCategories(resolvedCategories);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des données.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { 
        products, 
        categories, 
        loading, 
        error, 
        fetchProducts, 
        fetchCategories, 
        fetchByCategory,
        fetchAll 
    };
};

export default useProducts;
