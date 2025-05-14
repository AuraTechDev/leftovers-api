import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { RatingsRepository } from './infrastructure/repositories/ratings.repository';
import { SubmitRatingUseCase } from './application/use-cases/submit-rating.use-case';
import { GetBusinessRatingsUseCase } from './application/use-cases/get-business-ratings.use-case';
import { RatingsController } from './infrastructure/controllers/ratings.controller';

@Module({
  imports: [PrismaModule, ProductsModule, OrdersModule],
  controllers: [RatingsController],
  providers: [
    // Repositories
    RatingsRepository,

    // Use cases
    SubmitRatingUseCase,
    GetBusinessRatingsUseCase,
  ],
  exports: [RatingsRepository],
})
export class RatingsModule {}
