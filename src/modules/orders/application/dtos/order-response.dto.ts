import { OrderStatus, Product, User, Business } from '@prisma/client';
import { Order } from '../../domain/entities/order.entity';

export class OrderResponseDto {
  id: number;
  userId: number;
  productId: number;
  businessId: number;
  quantity: number;
  status: OrderStatus;
  pickupTime: Date;
  createdAt: Date;
  updatedAt: Date;

  // Additional properties from relations
  product?: Product;
  user?: User;
  business?: Business;

  static fromEntity(
    order: Order & { product?: Product; user?: User; business?: Business },
  ): OrderResponseDto {
    const dto = new OrderResponseDto();
    dto.id = order.id;
    dto.userId = order.userId;
    dto.productId = order.productId;
    dto.businessId = order.businessId;
    dto.quantity = order.quantity;
    dto.status = order.status;
    dto.pickupTime = order.pickupTime;
    dto.createdAt = order.createdAt;
    dto.updatedAt = order.updatedAt;

    // Include related entities if available
    if (order.product) dto.product = order.product;
    if (order.user) dto.user = order.user;
    if (order.business) dto.business = order.business;

    return dto;
  }
}
