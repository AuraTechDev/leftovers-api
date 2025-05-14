import {
  DiscoverSection,
  SectionType,
} from '../../domain/entities/discover-section.entity';

export class DiscoverSectionResponseDto {
  id: number;
  title: string;
  slug: string;
  type: SectionType;
  queryConfig?: Record<string, any> | null;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;

  static fromEntity(
    discoverSection: DiscoverSection,
  ): DiscoverSectionResponseDto {
    const response = new DiscoverSectionResponseDto();
    response.id = discoverSection.id;
    response.title = discoverSection.title;
    response.slug = discoverSection.slug;
    response.type = discoverSection.type;
    response.queryConfig = discoverSection.queryConfig;
    response.isActive = discoverSection.isActive;
    response.priority = discoverSection.priority;
    response.createdAt = discoverSection.createdAt;
    response.updatedAt = discoverSection.updatedAt;
    return response;
  }
}
