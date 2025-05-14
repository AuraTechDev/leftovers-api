import { Injectable } from '@nestjs/common';
import { OrdersRepository } from '../../infrastructure/repositories/orders.repository';
import { CreateOrderDto } from '../dtos/create-order.dto';
import { Order } from '../../domain/entities/order.entity';
import { OrderResponseDto } from '../dtos/order-response.dto';
import { ProductInventoryService } from '../../../products/application/services/product-inventory.service';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productInventoryService: ProductInventoryService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    // Use transaction to ensure atomicity of inventory check and order creation
    return this.prisma.$transaction(async (prisma) => {
      // 1. Validate product availability and quantity, and decrease stock
      await this.productInventoryService.validateAndDecreaseInventory(
        createOrderDto.productId,
        createOrderDto.quantity,
        prisma,
      );

      // 2. Create the order
      const order = new Order();
      Object.assign(order, {
        ...createOrderDto,
        status: createOrderDto.status || OrderStatus.PENDING,
      });

      const createdOrder = await prisma.order.create({
        data: order,
        include: {
          product: true,
          user: true,
          business: true,
        },
      });

      return OrderResponseDto.fromEntity(createdOrder);
    });
  }
}
