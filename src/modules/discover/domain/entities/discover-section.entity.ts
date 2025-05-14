export enum SectionType {
  PRODUCTS = 'PRODUCTS',
  BUSINESSES = 'BUSINESSES',
}

/**
 * Interface for the queryConfig JSON field
 * This is intentionally flexible to allow for future extensions
 * Example configurations:
 * - For PRODUCTS type: { closeToExpiry: true, maxItems: 10, productType: 1 }
 * - For BUSINESSES type: { distance: 5, maxItems: 10, businessType: "restaurant" }
 */
export interface QueryConfig {
  [key: string]: string | number | boolean | null | undefined;
}

export class DiscoverSection {
  id: number;
  title: string;
  slug: string;
  type: SectionType;
  queryConfig?: QueryConfig | null;
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}
