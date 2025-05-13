import { Injectable } from '@nestjs/common';
import { BusinessRepository } from '../../infrastructure/repositories/business.repository';
import { Business } from '../../domain/entities/business.entity';

@Injectable()
export class GetAllBusinessesUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(): Promise<Business[]> {
    return await this.businessRepository.findAll();
  }
}
