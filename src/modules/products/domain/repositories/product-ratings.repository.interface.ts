import { Rating } from '../../../ratings/domain/entities/rating.entity';

export interface IProductRatingsRepository {
  findByProduct(productId: number, limit?: number): Promise<Rating[]>;
  getProductAverageRating(
    productId: number,
  ): Promise<{ average: number; count: number }>;
}
