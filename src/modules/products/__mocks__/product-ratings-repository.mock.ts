import { Rating } from '@prisma/client';

export type MockPrismaService = {
  rating: {
    findMany: jest.Mock;
  };
};

export const createMockPrismaService = (): MockPrismaService => ({
  rating: {
    findMany: jest.fn(),
  },
});

export interface MockRatingWithUser extends Rating {
  user?: {
    id: number;
    name: string;
  } | null;
}

export const createMockRating = (
  override: Partial<MockRatingWithUser> = {},
): MockRatingWithUser => ({
  id: 1,
  rating: 4,
  comment: 'Great product!',
  userId: 1,
  productId: 1,
  businessId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: {
    id: 1,
    name: 'Test User',
  },
  ...override,
});

export const createMockRatingsArray = (count = 3): MockRatingWithUser[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockRating({ id: index + 1 }),
  );
};

export const createMockRatingsForAverage = (ratings: number[] = [4, 5, 3]) => {
  return ratings.map((rating) => ({ rating }));
};
