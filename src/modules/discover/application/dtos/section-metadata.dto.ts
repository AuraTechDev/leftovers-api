import { SectionType } from '../../domain/entities/discover-section.entity';

export class SectionMetadataDto {
  id: number;
  title: string;
  slug: string;
  type: SectionType;
}

export class SectionsMetadataResponseDto {
  sections: SectionMetadataDto[];
}
