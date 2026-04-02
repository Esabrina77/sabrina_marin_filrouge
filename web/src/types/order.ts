import { PagedResponse } from './product';

export enum OrderStatus {
  PENDING = 'PENDING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface OrderItem {
  id: number;
  productId: string;
  productName: string;
  quantity: number;
  priceAtReservation: number;
}

export interface Order {
  id: string;
  orderReference: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  items: OrderItem[];
}

export interface OrderFilters {
  status?: OrderStatus;
  page?: number;
  size?: number;
  sort?: string;
  reference?: string;
  search?: string;
}
