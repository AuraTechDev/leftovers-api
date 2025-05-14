import { SectionType } from '../../domain/entities/discover-section.entity';

export class LightProductDto {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
  businessName?: string;
  businessId: number;
  quantity: number;
}

export class LightBusinessDto {
  id: number;
  name: string;
  address: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
}

export class LightSectionDto {
  id: number;
  title: string;
  slug: string;
  type: SectionType;
  items: LightProductDto[] | LightBusinessDto[];
}

export class LightDiscoverResponseDto {
  sections: LightSectionDto[];
}
