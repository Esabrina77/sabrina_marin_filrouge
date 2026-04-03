import { useState, useEffect, useCallback } from 'react';
import { Product, Category, PagedResponse } from '../types/product';
import ProductService from '../services/productService';

export const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = useCallback(async (page = 0, size = 10) => {
        setLoading(true);
        setError(null);
        try {
            const response: PagedResponse<Product> = await ProductService.getAll(page, size);
            setProducts(response.content);
            return response;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des produits. Veuillez réessayer.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await ProductService.getCategories();
            setCategories(data);
            return data;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Erreur lors du chargement des catégories.');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchByCategory = useCallback(async (category: string) => {
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
                ProductService.getAll(0, 50), // Fetch a good amount for the home page
                ProductService.getCategories()
            ]);
            setProducts(productsResp.content);
            setCategories(categoriesResp);
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
