import { Injectable, NotFoundException } from '@nestjs/common';
import { BusinessRepository } from '../../infrastructure/repositories/business.repository';
import { BusinessResponseDto } from '../dtos/business-response.dto';

@Injectable()
export class GetBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(id: number): Promise<BusinessResponseDto> {
    const business = await this.businessRepository.findById(id);
    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }
    return BusinessResponseDto.fromEntity(business);
  }
}
