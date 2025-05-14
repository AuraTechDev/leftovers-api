import { Injectable, NotFoundException } from '@nestjs/common';
import { DiscoverSectionRepository } from '../../infrastructure/repositories/discover-section.repository';

@Injectable()
export class DeleteDiscoverSectionUseCase {
  constructor(
    private readonly discoverSectionRepository: DiscoverSectionRepository,
  ) {}

  async execute(id: number): Promise<void> {
    const section = await this.discoverSectionRepository.findById(id);
    if (!section) {
      throw new NotFoundException(`Discover section with ID ${id} not found`);
    }

    await this.discoverSectionRepository.delete(id);
  }
}
