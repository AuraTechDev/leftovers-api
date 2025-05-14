import { Injectable } from '@nestjs/common';
import { Rating } from '../../../ratings/domain/entities/rating.entity';
import { IProductRatingsRepository } from '../../domain/repositories/product-ratings.repository.interface';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ProductRatingsRepository implements IProductRatingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByProduct(productId: number, limit?: number): Promise<Rating[]> {
    const results = await this.prisma.rating.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
    return results as unknown as Rating[];
  }

  async getProductAverageRating(
    productId: number,
  ): Promise<{ average: number; count: number }> {
    const ratings = await this.prisma.rating.findMany({
      where: { productId },
      select: { rating: true },
    });

    if (ratings.length === 0) {
      return { average: 0, count: 0 };
    }

    const total = ratings.reduce((sum, r) => sum + r.rating, 0);
    const average = total / ratings.length;

    return {
      average: parseFloat(average.toFixed(1)),
      count: ratings.length,
    };
  }
}
