// Mock for Product entity
export interface MockProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  isFeatured: boolean;
  isDisabled: boolean;
  foodTypeId: number | null;
  businessId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create a mock product
export const createMockProduct = (
  override: Partial<MockProduct> = {},
): MockProduct => ({
  id: 1,
  name: 'Test Product',
  description: 'Description',
  price: 10.0,
  quantity: 5,
  imageUrl: null,
  isFeatured: false,
  isDisabled: false,
  foodTypeId: null,
  businessId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...override,
});

// Create variants of products
export const createFeaturedProduct = () =>
  createMockProduct({ isFeatured: true });

export const createDisabledProduct = () =>
  createMockProduct({ isDisabled: true });

// Mock for ProductsRepository
export const createMockProductsRepository = () => ({
  findById: jest.fn(),
  update: jest.fn(),
});
