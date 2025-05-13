import { Injectable, NotFoundException } from '@nestjs/common';
import { BusinessRepository } from '../../infrastructure/repositories/business.repository';

@Injectable()
export class DeleteBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(id: string): Promise<void> {
    const business = await this.businessRepository.findById(id);
    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    await this.businessRepository.delete(id);
  }
}
