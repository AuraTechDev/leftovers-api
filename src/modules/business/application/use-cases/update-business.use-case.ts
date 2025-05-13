import { Injectable, NotFoundException } from '@nestjs/common';
import { BusinessRepository } from '../../infrastructure/repositories/business.repository';
import { UpdateBusinessDto } from '../dtos/update-business.dto';
import { BusinessResponseDto } from '../dtos/business-response.dto';

@Injectable()
export class UpdateBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(
    id: number,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<BusinessResponseDto> {
    const business = await this.businessRepository.findById(id);
    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    // Update the entity with new values
    const updatedBusiness = {
      ...business,
      ...updateBusinessDto,
    };

    // Pass the entity to the repository
    const result = await this.businessRepository.update(id, updatedBusiness);
    return BusinessResponseDto.fromEntity(result);
  }
}
