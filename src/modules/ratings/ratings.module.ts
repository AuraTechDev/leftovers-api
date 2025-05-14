import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { RatingsRepository } from './infrastructure/repositories/ratings.repository';
import { SubmitRatingUseCase } from './application/use-cases/submit-rating.use-case';
import { GetProductRatingsUseCase } from './application/use-cases/get-product-ratings.use-case';
import { GetBusinessRatingsUseCase } from './application/use-cases/get-business-ratings.use-case';
import {
  RatingsController,
  ProductRatingsController,
} from './infrastructure/controllers/ratings.controller';

@Module({
  imports: [PrismaModule, ProductsModule, OrdersModule],
  controllers: [RatingsController, ProductRatingsController],
  providers: [
    // Repositories
    RatingsRepository,

    // Use cases
    SubmitRatingUseCase,
    GetProductRatingsUseCase,
    GetBusinessRatingsUseCase,
  ],
  exports: [RatingsRepository],
})
export class RatingsModule {}
