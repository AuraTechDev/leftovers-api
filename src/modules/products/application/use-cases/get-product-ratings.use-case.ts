import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRatingsRepository } from '../../infrastructure/repositories/product-ratings.repository';
import { ProductsRepository } from '../../infrastructure/repositories/products.repository';
import {
  ProductRatingItemDto,
  ProductRatingsResponseDto,
} from '../dtos/product-ratings-response.dto';

@Injectable()
export class GetProductRatingsUseCase {
  constructor(
    private readonly productRatingsRepository: ProductRatingsRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async execute(productId: number): Promise<ProductRatingsResponseDto> {
    const product = await this.productsRepository.findById(productId);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const { average, count } =
      await this.productRatingsRepository.getProductAverageRating(productId);

    const ratingsData = await this.productRatingsRepository.findByProduct(
      productId,
      10,
    );

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
