import { FoodType } from '@prisma/client';

export type MockPrismaService = {
  foodType: {
    create: jest.Mock;
    findMany: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

export const createMockPrismaService = (): MockPrismaService => ({
  foodType: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
});

export const createMockFoodType = (
  override: Partial<FoodType> = {},
): FoodType => ({
  id: 1,
  name: 'Test Food Type',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...override,
});
