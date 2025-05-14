import { Product, FoodType } from '@prisma/client';
import { createMockFoodType } from './food-types-repository.mock';

export type MockPrismaService = {
  product: {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

export const createMockPrismaService = (): MockPrismaService => ({
  product: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

export const createMockProduct = (
  override: Partial<Product> = {},
): Product & { foodType: FoodType } => ({
  id: 1,
  name: 'Test Product',
  description: 'Test description',
  price: 10.99,
  quantity: 5,
  imageUrl: 'http://example.com/image.jpg',
  isFeatured: false,
  isDisabled: false,
  businessId: 1,
  foodTypeId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  foodType: createMockFoodType(),
  ...override,
});
