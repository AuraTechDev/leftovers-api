import { Injectable, ConflictException } from '@nestjs/common';
import { DiscoverSectionRepository } from '../../infrastructure/repositories/discover-section.repository';
import { CreateDiscoverSectionDto } from '../dtos/create-discover-section.dto';
import { DiscoverSection } from '../../domain/entities/discover-section.entity';
import { DiscoverSectionResponseDto } from '../dtos/discover-section-response.dto';

@Injectable()
export class CreateDiscoverSectionUseCase {
  constructor(
    private readonly discoverSectionRepository: DiscoverSectionRepository,
  ) {}

  async execute(
    createDiscoverSectionDto: CreateDiscoverSectionDto,
  ): Promise<DiscoverSectionResponseDto> {
    // Check if section with slug already exists
    const existingSection = await this.discoverSectionRepository.findBySlug(
      createDiscoverSectionDto.slug,
    );

    if (existingSection) {
      throw new ConflictException(
        `Section with slug '${createDiscoverSectionDto.slug}' already exists`,
      );
    }

    // Create new discover section
    const discoverSection = new DiscoverSection();
    Object.assign(discoverSection, {
      ...createDiscoverSectionDto,
    });

    // Pass the entity to the repository
    const createdSection =
      await this.discoverSectionRepository.create(discoverSection);
    return DiscoverSectionResponseDto.fromEntity(createdSection);
  }
}
