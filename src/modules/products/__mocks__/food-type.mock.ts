import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { FoodType } from '@prisma/client';

// Mock for FoodType entity
export interface MockFoodType {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create a mock food type
export const createMockFoodType = (
  override: Partial<MockFoodType> = {},
): MockFoodType => ({
  id: 1,
  name: 'Vegetarian',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...override,
});

// Mock data for CreateFoodTypeDto
export const createMockFoodTypeDto = (name = 'Vegetarian') => ({
  name,
});

// Mock data for UpdateFoodTypeDto
export const createMockUpdateFoodTypeDto = (name = 'Updated Vegetarian') => ({
  name,
});

// Mock for FoodTypeResponseDto
export const createMockFoodTypeResponseDto = (
  overrides: Partial<FoodType> = {},
): FoodType => ({
  id: 1,
  name: 'Test Food Type',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Mock for FoodTypesRepository
export const createMockFoodTypesRepository = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
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

export const createMockFoodTypesArray = (): FoodType[] => [
  createMockFoodTypeResponseDto({ id: 1, name: 'Food Type 1' }),
  createMockFoodTypeResponseDto({ id: 2, name: 'Food Type 2' }),
];

export const createMockFoodTypeUseCases = () => ({
  createFoodTypeUseCase: {
    execute: jest.fn(),
  },
  getAllFoodTypesUseCase: {
    execute: jest.fn(),
  },
  updateFoodTypeUseCase: {
    execute: jest.fn(),
  },
  deleteFoodTypeUseCase: {
    execute: jest.fn(),
  },
});
