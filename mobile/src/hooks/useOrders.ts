import { useState, useCallback } from 'react';
import { Order, OrderStatus } from '../types/order';
import OrderService from '../services/orderService';

export const useOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await OrderService.getHistory();
            setOrders(data);
            return data;
        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur lors de la récupération de l'historique.");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchById = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await OrderService.getById(id);
            setCurrentOrder(data);
            return data;
        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur lors de la récupération des détails de la commande.");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const createOrder = useCallback(async (items: { productId: string; quantity: number }[]) => {
        setLoading(true);
        setError(null);
        try {
            const data = await OrderService.create(items);
            setOrders(prev => [data, ...prev]);
            return data;
        } catch (err: any) {
            setError(err.response?.data?.message || "Échec de la création de la commande.");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStatus = useCallback(async (id: string, status: OrderStatus) => {
        setLoading(true);
        setError(null);
        try {
            const data = await OrderService.updateStatus(id, status);
            setOrders(prev => prev.map(o => o.id === id ? data : o));
            if (currentOrder?.id === id) setCurrentOrder(data);
            return data;
        } catch (err: any) {
            setError(err.response?.data?.message || "Erreur lors de la mise à jour du statut.");
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { orders, currentOrder, loading, error, fetchHistory, fetchById, createOrder, updateStatus };
};

export default useOrders;
