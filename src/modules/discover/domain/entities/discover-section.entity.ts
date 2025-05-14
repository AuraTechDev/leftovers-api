export enum SectionType {
  PRODUCTS = 'PRODUCTS',
  BUSINESSES = 'BUSINESSES',
}

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
