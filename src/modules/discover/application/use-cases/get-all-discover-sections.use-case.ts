import { Injectable } from '@nestjs/common';
import { DiscoverSectionRepository } from '../../infrastructure/repositories/discover-section.repository';
import { DiscoverSectionResponseDto } from '../dtos/discover-section-response.dto';

@Injectable()
export class GetAllDiscoverSectionsUseCase {
  constructor(
    private readonly discoverSectionRepository: DiscoverSectionRepository,
  ) {}

  async execute(): Promise<DiscoverSectionResponseDto[]> {
    const sections = await this.discoverSectionRepository.findAll();
    return sections.map((section) =>
      DiscoverSectionResponseDto.fromEntity(section),
    );
  }
}
