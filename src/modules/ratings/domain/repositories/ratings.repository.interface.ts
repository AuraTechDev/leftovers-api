import { Rating } from '../entities/rating.entity';

export interface IRatingsRepository {
  create(
    rating: Omit<Rating, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Rating>;
  findByUserAndProduct(
    userId: number,
    productId: number,
  ): Promise<Rating | null>;
  findByProduct(productId: number, limit?: number): Promise<Rating[]>;
  findByBusiness(businessId: number): Promise<Rating[]>;
  getProductAverageRating(
    productId: number,
  ): Promise<{ average: number; count: number }>;
}
