import { Injectable, NotFoundException } from '@nestjs/common';
import { BusinessRepository } from '../../infrastructure/repositories/business.repository';
import { Business } from '../../domain/entities/business.entity';

@Injectable()
export class GetBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(id: string): Promise<Business> {
    const business = await this.businessRepository.findById(id);
    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }
    return business;
  }
}
