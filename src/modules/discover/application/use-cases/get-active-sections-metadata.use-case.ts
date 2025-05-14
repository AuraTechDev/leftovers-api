import { Injectable } from '@nestjs/common';
import { DiscoverSectionRepository } from '../../infrastructure/repositories/discover-section.repository';
import {
  SectionsMetadataResponseDto,
  SectionMetadataDto,
} from '../dtos/section-metadata.dto';

@Injectable()
export class GetActiveSectionsMetadataUseCase {
  constructor(
    private readonly discoverSectionRepository: DiscoverSectionRepository,
  ) {}

  async execute(): Promise<SectionsMetadataResponseDto> {
    // Get all active sections ordered by priority
    const sections = await this.discoverSectionRepository.findAll();
    const activeSections = sections
      .filter((section) => section.isActive)
      .sort((a, b) => b.priority - a.priority); // Sort by priority (descending)

    // Map to lightweight DTOs with only essential metadata
    const sectionMetadata: SectionMetadataDto[] = activeSections.map(
      (section) => ({
        id: section.id,
        title: section.title,
        slug: section.slug,
        type: section.type,
      }),
    );

    return {
      sections: sectionMetadata,
    };
  }
}
