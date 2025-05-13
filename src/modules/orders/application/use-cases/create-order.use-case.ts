import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
      // 1. Validate product availability and quantity
      // Get the product with a lock for update
      const product = await prisma.product.findUnique({
        where: { id: createOrderDto.productId },
      });

      if (!product) {
        throw new NotFoundException(
          `Product with ID ${createOrderDto.productId} not found`,
        );
      }

      // Check if product is disabled
      if (product.isDisabled) {
        throw new BadRequestException(
          `Product with ID ${createOrderDto.productId} is currently unavailable`,
        );
      }

      // Check if product is out of stock
      if (product.quantity <= 0) {
        throw new BadRequestException(
          `Product with ID ${createOrderDto.productId} is out of stock`,
        );
      }

      // Check if there's enough stock
      if (createOrderDto.quantity > product.quantity) {
        throw new BadRequestException(
          `Requested quantity (${createOrderDto.quantity}) exceeds available stock (${product.quantity}) for product with ID ${createOrderDto.productId}`,
        );
      }

      // 2. Update the product quantity
      await prisma.product.update({
        where: { id: createOrderDto.productId },
        data: {
          quantity: {
            decrement: createOrderDto.quantity,
          },
        },
      });

      // 3. Create the order
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
