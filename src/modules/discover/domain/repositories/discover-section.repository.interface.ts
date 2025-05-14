import { DiscoverSection } from '../entities/discover-section.entity';

export interface IDiscoverSectionRepository {
  create(
    discoverSection: Omit<DiscoverSection, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<DiscoverSection>;
  findAll(): Promise<DiscoverSection[]>;
  findById(id: number): Promise<DiscoverSection | null>;
  findBySlug(slug: string): Promise<DiscoverSection | null>;
  update(
    id: number,
    discoverSection: Partial<
      Omit<DiscoverSection, 'id' | 'createdAt' | 'updatedAt'>
    >,
  ): Promise<DiscoverSection>;
  delete(id: number): Promise<void>;
}
