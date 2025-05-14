import { Order } from '../entities/order.entity';
import { OrderStatus } from '@prisma/client';

export interface IOrdersRepository {
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  findAll(userId?: number, businessId?: number): Promise<Order[]>;
  findById(id: number): Promise<Order | null>;
  update(
    id: number,
    order: Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Order>;
  delete(id: number): Promise<void>;
  updateStatus(id: number, status: OrderStatus): Promise<Order>;
  findPaginatedByUser(
    userId: number,
    page: number,
    pageSize: number,
    status?: OrderStatus,
  ): Promise<{ orders: Order[]; total: number }>;
  findPaginatedByBusiness(
    businessId: number,
    page: number,
    pageSize: number,
    status?: OrderStatus,
  ): Promise<{ orders: Order[]; total: number }>;
}
