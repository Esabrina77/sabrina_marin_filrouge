import api from '@/lib/api/client';
import { PagedResponse } from '@/types/product';
import { Order, OrderFilters, OrderStatus } from '@/types/order';

const ORDER_API_BASE = '/orders';

export const OrderService = {
  getAll: async (filters: OrderFilters = {}): Promise<PagedResponse<Order>> => {
    try {
      const params = new URLSearchParams();
      if (filters.page !== undefined) params.append('page', filters.page.toString());
      if (filters.size !== undefined) params.append('size', filters.size.toString());
      if (filters.sort) params.append('sort', filters.sort);

      let url = ORDER_API_BASE;
      if (filters.status) {
        url = `${ORDER_API_BASE}/filter`;
        params.append('status', filters.status);
      }
      if (filters.reference) params.append('reference', filters.reference);
      if (filters.search) params.append('reference', filters.search);

      const response = await api.get<PagedResponse<Order>>(url, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Order> => {
    try {
      const response = await api.get<Order>(`${ORDER_API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  },

  updateStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    try {
      const params = new URLSearchParams();
      params.append('status', status);
      const response = await api.patch<Order>(`${ORDER_API_BASE}/${id}/status`, {}, { params });
      return response.data;
    } catch (error) {
      console.error(`Error updating order status ${id}:`, error);
      throw error;
    }
  }
};

export default OrderService;
