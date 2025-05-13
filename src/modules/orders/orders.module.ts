import { Module } from '@nestjs/common';
import { OrdersRepository } from './infrastructure/repositories/orders.repository';
import { CreateOrderUseCase } from './application/use-cases/create-order.use-case';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { OrdersController } from './infrastructure/controllers/orders.controller';

@Module({
  imports: [PrismaModule, ProductsModule],
  controllers: [OrdersController],
  providers: [OrdersRepository, CreateOrderUseCase],
  exports: [OrdersRepository],
})
export class OrdersModule {}
