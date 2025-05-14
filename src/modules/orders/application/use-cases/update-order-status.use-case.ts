import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersRepository } from '../../infrastructure/repositories/orders.repository';
import { OrderResponseDto } from '../dtos/order-response.dto';
import { UpdateOrderStatusDto } from '../dtos/update-order-status.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UpdateOrderStatusUseCase {
  constructor(private readonly ordersRepository: OrdersRepository) {}

  async execute(
    orderId: number,
    updateOrderStatusDto: UpdateOrderStatusDto,
    userId: number,
    userRole: Role,
  ): Promise<OrderResponseDto> {
    // Find the order to check ownership
    const order = await this.ordersRepository.findById(orderId);

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Verify the user is authorized to update this order
    // Only BUSINESS users who belong to the business of the order can update the status
    if (userRole === Role.BUSINESS && order.businessId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this order',
      );
    }

    // Update the order status
    const updatedOrder = await this.ordersRepository.updateStatus(
      orderId,
      updateOrderStatusDto.status,
    );

    return OrderResponseDto.fromEntity(updatedOrder);
  }
}
