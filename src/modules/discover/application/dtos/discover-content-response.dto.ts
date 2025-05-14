import { SectionType } from '../../domain/entities/discover-section.entity';
import { BusinessResponseDto } from '../../../business/application/dtos/business-response.dto';
import { ProductResponseDto } from '../../../products/application/dtos/product-response.dto';

export class DiscoverSectionContentDto {
  id: number;
  title: string;
  slug: string;
  type: SectionType;
  items: ProductResponseDto[] | BusinessResponseDto[];
}

export class DiscoverContentResponseDto {
  sections: DiscoverSectionContentDto[];
}
