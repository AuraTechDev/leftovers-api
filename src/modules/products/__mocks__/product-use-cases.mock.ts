import { ProductResponseDto } from '../application/dtos/product-response.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

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

// Mock CreateProductDto
export const createMockCreateProductDto = (
  override: Partial<{
    name: string;
    description: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    isFeatured?: boolean;
    isDisabled?: boolean;
    foodTypeId?: number;
    businessId: number;
  }> = {},
) => ({
  name: 'Test Product',
  description: 'Description',
  price: 10.0,
  quantity: 5,
  businessId: 1,
  ...override,
});

// Mock UpdateProductDto
export const createMockUpdateProductDto = (
  override: Partial<{
    name?: string;
    description?: string;
    price?: number;
    quantity?: number;
    imageUrl?: string;
    isFeatured?: boolean;
    isDisabled?: boolean;
    foodTypeId?: number;
  }> = {},
) => ({
  name: 'Updated Product',
  description: 'Updated Description',
  price: 15.0,
  quantity: 10,
  ...override,
});

// Mock ProductResponseDto
export const createMockProductResponseDto = (
  override: Partial<MockProduct & { foodType?: null }> = {},
) => {
  const product = createMockProduct(override);

  // Create a ProductResponseDto instance with correct structure
  const dto = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    quantity: product.quantity,
    imageUrl: product.imageUrl,
    isFeatured: product.isFeatured,
    isDisabled: product.isDisabled,
    foodType: null, // Default to null, since we're not testing with food types
    businessId: product.businessId,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };

  // Add prototype to match the actual class instance
  Object.setPrototypeOf(dto, ProductResponseDto.prototype);
  return dto;
};

// Mock for ProductsRepository with more complete methods needed for create tests
export const createMockProductsRepository = () => ({
  create: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  decreaseQuantity: jest.fn(),
});

// Helper to create a Prisma unique constraint error (P2002)
export const createPrismaUniqueConstraintError = (
  target: string[] = ['name'],
) => {
  return new PrismaClientKnownRequestError('Unique constraint violation', {
    code: 'P2002',
    clientVersion: '4.8.0',
    meta: { target },
  });
};

// Helper to create a Prisma foreign key constraint error (P2003)
export const createPrismaForeignKeyConstraintError = (
  foreignKey: string = 'Product_foodTypeId_fkey',
) => {
  return new PrismaClientKnownRequestError('Foreign key constraint failed', {
    code: 'P2003',
    clientVersion: '4.8.0',
    meta: {
      field_name: foreignKey,
    },
  });
};
