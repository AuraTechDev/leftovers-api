import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DiscoverSectionRepository } from '../../infrastructure/repositories/discover-section.repository';
import { UpdateDiscoverSectionDto } from '../dtos/update-discover-section.dto';
import { DiscoverSectionResponseDto } from '../dtos/discover-section-response.dto';

@Injectable()
export class UpdateDiscoverSectionUseCase {
  constructor(
    private readonly discoverSectionRepository: DiscoverSectionRepository,
  ) {}

  async execute(
    id: number,
    updateDiscoverSectionDto: UpdateDiscoverSectionDto,
  ): Promise<DiscoverSectionResponseDto> {
    // Check if section exists
    const existingSection = await this.discoverSectionRepository.findById(id);
    if (!existingSection) {
      throw new NotFoundException(`Discover section with ID ${id} not found`);
    }

    // If slug is being updated, check that it doesn't conflict with another section
    if (
      updateDiscoverSectionDto.slug &&
      updateDiscoverSectionDto.slug !== existingSection.slug
    ) {
      const sectionWithSlug = await this.discoverSectionRepository.findBySlug(
        updateDiscoverSectionDto.slug,
      );

      if (sectionWithSlug && sectionWithSlug.id !== id) {
        throw new ConflictException(
          `Section with slug '${updateDiscoverSectionDto.slug}' already exists`,
        );
      }
    }

    // Update the section
    const updatedSection = await this.discoverSectionRepository.update(
      id,
      updateDiscoverSectionDto,
    );
    return DiscoverSectionResponseDto.fromEntity(updatedSection);
  }
}
