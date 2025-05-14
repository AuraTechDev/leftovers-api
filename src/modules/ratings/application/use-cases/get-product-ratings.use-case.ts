import { Injectable, NotFoundException } from '@nestjs/common';
import { RatingsRepository } from '../../infrastructure/repositories/ratings.repository';
import { ProductsRepository } from '../../../products/infrastructure/repositories/products.repository';
import {
  ProductRatingsResponseDto,
  ProductRatingItemDto,
} from '../dtos/product-ratings-response.dto';

@Injectable()
export class GetProductRatingsUseCase {
  constructor(
    private readonly ratingsRepository: RatingsRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async execute(productId: number): Promise<ProductRatingsResponseDto> {
    // Check if product exists
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get average rating and count
    const { average, count } =
      await this.ratingsRepository.getProductAverageRating(productId);

    // Get the 10 most recent ratings
    const ratingsData = await this.ratingsRepository.findByProduct(
      productId,
      10,
    );

    // Map the ratings to the expected format
    const ratings = ratingsData.map(
      (rating) =>
        ({
          id: rating.id,
          userId: rating.userId,
          user: {
            id: rating.user?.id ?? 0,
            name: rating.user?.name ?? 'Unknown User',
          },
          rating: rating.rating,
          comment: rating.comment,
          createdAt: rating.createdAt,
        }) as ProductRatingItemDto,
    );

    return {
      average,
      count,
      ratings,
    };
  }
}
