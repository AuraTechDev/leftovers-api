import { Injectable } from '@nestjs/common';
import { RatingsRepository } from '../../infrastructure/repositories/ratings.repository';
import { BusinessRatingsQueryDto } from '../dtos/business-ratings-query.dto';

@Injectable()
export class GetBusinessRatingsUseCase {
  constructor(private readonly ratingsRepository: RatingsRepository) {}

  async execute(businessId: number, query: BusinessRatingsQueryDto) {
    // Process query parameters
    const options = {
      productId: query.productId,
      ratingValue: query.ratingValue,
      startDate: query.startDate ? new Date(query.startDate) : undefined,
      endDate: query.endDate ? new Date(query.endDate) : undefined,
    };

    // Get business ratings with filters
    const ratings = await this.ratingsRepository.findByBusiness(
      businessId,
      options,
    );

    return ratings;
  }
}
