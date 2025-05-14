import { Rating } from '../domain/entities/rating.entity';

// Type for the ratings repository mock PrismaService
export interface MockPrismaService {
  rating: {
    create: jest.Mock;
    findUnique: jest.Mock;
    findMany: jest.Mock;
  };
}

// Mock for PrismaService
export const createMockPrismaService = (): MockPrismaService => ({
  rating: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
});

// Mock rating data without id and dates
export const createMockRatingData = (): Omit<
  Rating,
  'id' | 'createdAt' | 'updatedAt'
> => ({
  userId: 123,
  productId: 456,
  businessId: 789,
  rating: 4,
  comment: 'Great product!',
});

// Mock rating entity
export const createMockRating = (override: Partial<Rating> = {}): Rating => ({
  id: 1,
  userId: 123,
  productId: 456,
  businessId: 789,
  rating: 4,
  comment: 'Great product!',
  createdAt: new Date('2023-01-15'),
  updatedAt: new Date('2023-01-15'),
  ...override,
});

// Mock rating with relations
export const createMockRatingWithRelations = (
  override: Partial<
    Rating & {
      user: any;
      product: any;
      business: any;
    }
  > = {},
) => ({
  id: 1,
  userId: 123,
  productId: 456,
  businessId: 789,
  rating: 4,
  comment: 'Great product!',
  createdAt: new Date('2023-01-15'),
  updatedAt: new Date('2023-01-15'),
  user: { id: 123, name: 'Test User' },
  product: { id: 456, name: 'Test Product' },
  business: { id: 789, name: 'Test Business' },
  ...override,
});

// Mock multiple ratings
export const createMockRatingsList = (count = 2): Rating[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockRating({
      id: index + 1,
      userId: 123 + index,
      comment: `Rating comment ${index + 1}`,
    }),
  );
};

// Mock ratings with relations
export const createMockRatingsWithRelationsList = (count = 2) => {
  return Array.from({ length: count }, (_, index) =>
    createMockRatingWithRelations({
      id: index + 1,
      userId: 123 + index,
      comment: `Rating comment ${index + 1}`,
      user: { id: 123 + index, name: `User ${index + 1}` },
    }),
  );
};
