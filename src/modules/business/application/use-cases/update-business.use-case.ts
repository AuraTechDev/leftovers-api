import { Injectable, NotFoundException } from '@nestjs/common';
import { BusinessRepository } from '../../infrastructure/repositories/business.repository';
import { UpdateBusinessDto } from '../dtos/update-business.dto';
import { BusinessResponseDto } from '../dtos/business-response.dto';
import { BusinessAuthorizationService } from '../services/business-authorization.service';
import { AuthUser } from '../../../auth/domain/interfaces/user.interface';

@Injectable()
export class UpdateBusinessUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly businessAuthorizationService: BusinessAuthorizationService,
  ) {}

  async execute(
    id: number,
    updateBusinessDto: UpdateBusinessDto,
    currentUser: AuthUser,
  ): Promise<BusinessResponseDto> {
    await this.businessAuthorizationService.verifyBusinessAccess(
      currentUser,
      id,
      'update',
    );

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
