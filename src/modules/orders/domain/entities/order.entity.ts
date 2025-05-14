import { OrderStatus } from '@prisma/client';

export class Order {
  id: number;
  userId: number;
  productId: number;
  businessId: number;
  quantity: number;
  status: OrderStatus;
  pickupTime: Date;
  createdAt: Date;
  updatedAt: Date;
}
