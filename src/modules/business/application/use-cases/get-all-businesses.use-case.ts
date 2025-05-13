import { Injectable } from '@nestjs/common';
import { BusinessRepository } from '../../infrastructure/repositories/business.repository';
import { BusinessResponseDto } from '../dtos/business-response.dto';

@Injectable()
export class GetAllBusinessesUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(): Promise<BusinessResponseDto[]> {
    const businesses = await this.businessRepository.findAll();
    return businesses.map((business) =>
      BusinessResponseDto.fromEntity(business),
    );
  }
}
