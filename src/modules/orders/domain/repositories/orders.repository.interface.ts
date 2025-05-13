import { Order } from '../entities/order.entity';

export interface IOrdersRepository {
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  findAll(userId?: number, businessId?: number): Promise<Order[]>;
  findById(id: number): Promise<Order | null>;
  update(
    id: number,
    order: Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<Order>;
  delete(id: number): Promise<void>;
}
