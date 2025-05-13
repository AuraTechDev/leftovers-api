import { Injectable } from '@nestjs/common';
import { BusinessRepository } from '../../infrastructure/repositories/business.repository';
import { CreateBusinessDto } from '../dtos/create-business.dto';
import { Business } from '../../domain/entities/business.entity';
import { BusinessResponseDto } from '../dtos/business-response.dto';

@Injectable()
export class CreateBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(
    createBusinessDto: CreateBusinessDto,
  ): Promise<BusinessResponseDto> {
    // Create new business entity first
    const business = new Business();
    Object.assign(business, {
      ...createBusinessDto,
    });

    // Pass the entity to the repository
    const createdBusiness = await this.businessRepository.create(business);
    return BusinessResponseDto.fromEntity(createdBusiness);
  }
}
