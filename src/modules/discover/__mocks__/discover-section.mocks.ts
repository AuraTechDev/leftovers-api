import {
  DiscoverSection,
  SectionType,
} from '../domain/entities/discover-section.entity';
import { DiscoverSectionResponseDto } from '../application/dtos/discover-section-response.dto';
import {
  LightProductDto,
  LightBusinessDto,
  LightSectionDto,
} from '../application/dtos/light-response.dto';

/**
 * Mock discover section entity
 */
export const mockDiscoverSection: DiscoverSection = {
  id: 1,
  title: 'Test Section',
  slug: 'test-section',
  type: SectionType.PRODUCTS,
  queryConfig: { maxItems: 5 },
  isActive: true,
  priority: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Mock inactive discover section entity
 */
export const mockInactiveDiscoverSection: DiscoverSection = {
  ...mockDiscoverSection,
  id: 2,
  title: 'Inactive Section',
  slug: 'inactive-section',
  isActive: false,
};

/**
 * Mock business section entity
 */
export const mockBusinessDiscoverSection: DiscoverSection = {
  ...mockDiscoverSection,
  id: 3,
  title: 'Business Section',
  slug: 'business-section',
  type: SectionType.BUSINESSES,
  queryConfig: { distance: 5 },
};

/**
 * Mock discover section response DTO
 */
export const mockDiscoverSectionResponse: DiscoverSectionResponseDto = {
  id: 1,
  title: 'Test Section',
  slug: 'test-section',
  type: SectionType.PRODUCTS,
  queryConfig: { maxItems: 5 },
  isActive: true,
  priority: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Mock products for the discover content
 */
export const mockLightProducts: LightProductDto[] = [
  {
    id: 1,
    name: 'Test Product 1',
    price: 10.99,
    imageUrl: 'https://example.com/product1.jpg',
    businessName: 'Test Business',
    businessId: 1,
    quantity: 5,
  },
  {
    id: 2,
    name: 'Test Product 2',
    price: 15.99,
    imageUrl: 'https://example.com/product2.jpg',
    businessName: 'Test Business',
    businessId: 1,
    quantity: 3,
  },
];

/**
 * Mock businesses for the discover content
 */
export const mockLightBusinesses: LightBusinessDto[] = [
  {
    id: 1,
    name: 'Test Business 1',
    address: '123 Test St',
    logoUrl: 'https://example.com/logo1.jpg',
    bannerUrl: 'https://example.com/banner1.jpg',
  },
  {
    id: 2,
    name: 'Test Business 2',
    address: '456 Example Ave',
    logoUrl: 'https://example.com/logo2.jpg',
    bannerUrl: null,
  },
];

/**
 * Mock section contents
 */
export const mockProductSectionContent: LightSectionDto = {
  id: 1,
  title: 'Test Section',
  slug: 'test-section',
  type: SectionType.PRODUCTS,
  items: mockLightProducts,
};

export const mockBusinessSectionContent: LightSectionDto = {
  id: 3,
  title: 'Business Section',
  slug: 'business-section',
  type: SectionType.BUSINESSES,
  items: mockLightBusinesses,
};
