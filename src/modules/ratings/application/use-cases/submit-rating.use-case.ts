import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { RatingsRepository } from '../../infrastructure/repositories/ratings.repository';
import { OrdersRepository } from '../../../orders/infrastructure/repositories/orders.repository';
import { ProductsRepository } from '../../../products/infrastructure/repositories/products.repository';
import { CreateRatingDto } from '../dtos/create-rating.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class SubmitRatingUseCase {
  constructor(
    private readonly ratingsRepository: RatingsRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async execute(userId: number, createRatingDto: CreateRatingDto) {
    // Check if the user has already rated this product
    const existingRating = await this.ratingsRepository.findByUserAndProduct(
      userId,
      createRatingDto.productId,
    );

    if (existingRating) {
      throw new BadRequestException(
        'You have already submitted a rating for this product',
      );
    }

    // Check if the user has purchased this product
    const userOrders = await this.ordersRepository.findAll(userId);

    const hasCompletedOrder = userOrders.some(
      (order) =>
        order.productId === createRatingDto.productId &&
        order.status === OrderStatus.COMPLETED,
    );

    if (!hasCompletedOrder) {
      throw new UnauthorizedException(
        'You can only rate products you have purchased and received',
      );
    }

    // Get the product to access the businessId
    const product = await this.productsRepository.findById(
      createRatingDto.productId,
    );

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    // Create the rating
    return this.ratingsRepository.create({
      userId,
      productId: createRatingDto.productId,
      businessId: product.businessId,
      rating: createRatingDto.rating,
      comment: createRatingDto.comment,
    });
  }
}
