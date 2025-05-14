import { Injectable, NotFoundException } from '@nestjs/common';
import { DiscoverSectionRepository } from '../../infrastructure/repositories/discover-section.repository';
import { DiscoverSectionResponseDto } from '../dtos/discover-section-response.dto';

@Injectable()
export class GetDiscoverSectionUseCase {
  constructor(
    private readonly discoverSectionRepository: DiscoverSectionRepository,
  ) {}

  async execute(id: number): Promise<DiscoverSectionResponseDto> {
    const section = await this.discoverSectionRepository.findById(id);
    if (!section) {
      throw new NotFoundException(`Discover section with ID ${id} not found`);
    }
    return DiscoverSectionResponseDto.fromEntity(section);
  }
}
