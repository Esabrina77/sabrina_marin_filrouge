import api from '../api/client';
import { Order, OrderStatus } from '../types/order';

export const OrderService = {
  getHistory: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders/my-orders');
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  create: async (items: { productId: string; quantity: number }[]): Promise<Order> => {
    const response = await api.post<Order>('/orders', { items });
    return response.data;
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  }
};

export default OrderService;
