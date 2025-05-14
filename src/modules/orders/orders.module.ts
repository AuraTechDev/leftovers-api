import { Module } from '@nestjs/common';
import { OrdersRepository } from './infrastructure/repositories/orders.repository';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { OrdersController } from './infrastructure/controllers/orders.controller';
import { UpdateOrderStatusUseCase } from './application/use-cases/update-order-status.use-case';
import { GetUserOrdersUseCase } from './application/use-cases/get-user-orders.use-case';
import { GetBusinessOrdersUseCase } from './application/use-cases/get-business-orders.use-case';

@Module({
  imports: [PrismaModule, ProductsModule],
  controllers: [OrdersController],
  providers: [
    OrdersRepository,
    CreateOrderUseCase,
    UpdateOrderStatusUseCase,
    GetUserOrdersUseCase,
    GetBusinessOrdersUseCase,
  ],
  exports: [OrdersRepository],
})
export class OrdersModule {}
