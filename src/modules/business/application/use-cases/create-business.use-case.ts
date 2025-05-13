import { Injectable } from '@nestjs/common';
import { BusinessRepository } from '../../infrastructure/repositories/business.repository';
import { CreateBusinessDto } from '../dtos/create-business.dto';
import { Business } from '../../domain/entities/business.entity';

@Injectable()
export class CreateBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(createBusinessDto: CreateBusinessDto): Promise<Business> {
    return await this.businessRepository.create(createBusinessDto);
  }
}
