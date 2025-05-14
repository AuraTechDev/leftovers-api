import { Injectable } from '@nestjs/common';
import { Rating } from '../../domain/entities/rating.entity';
import { IRatingsRepository } from '../../domain/repositories/ratings.repository.interface';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RatingsRepository implements IRatingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    rating: Omit<Rating, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Rating> {
    const result = await this.prisma.rating.create({
      data: rating as Prisma.RatingUncheckedCreateInput,
      include: {
        user: true,
        product: true,
        business: true,
      },
    });
    return result as unknown as Rating;
  }

  async findByUserAndProduct(
    userId: number,
    productId: number,
  ): Promise<Rating | null> {
    const result = await this.prisma.rating.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      include: {
        user: true,
        product: true,
        business: true,
      },
    });
    return result as unknown as Rating | null;
  }

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

  async findByBusiness(
    businessId: number,
    options?: {
      productId?: number;
      startDate?: Date;
      endDate?: Date;
      ratingValue?: number;
    },
  ): Promise<Rating[]> {
    const where: Prisma.RatingWhereInput = { businessId };

    if (options?.productId) {
      where.productId = options.productId;
    }

    if (options?.ratingValue) {
      where.rating = options.ratingValue;
    }

    if (options?.startDate || options?.endDate) {
      where.createdAt = {};

      if (options?.startDate) {
        where.createdAt.gte = options.startDate;
      }

      if (options?.endDate) {
        where.createdAt.lte = options.endDate;
      }
    }

    const results = await this.prisma.rating.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return results as unknown as Rating[];
  }
}
