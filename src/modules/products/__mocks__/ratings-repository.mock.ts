import { Rating } from '../../ratings/domain/entities/rating.entity';
import { Role, Provider } from '@prisma/client';

// Mock Rating Data
export const mockRatingData: Rating[] = [
  {
    id: 1,
    userId: 1,
    productId: 1,
    businessId: 1,
    rating: 5,
    comment: 'Great product!',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    user: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: Role.USER,
      provider: Provider.LOCAL,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    id: 2,
    userId: 2,
    productId: 1,
    businessId: 1,
    rating: 4,
    comment: 'Good value for money',
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    user: {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: Role.USER,
      provider: Provider.LOCAL,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    id: 3,
    userId: 3,
    productId: 1,
    businessId: 1,
    rating: 3,
    comment: 'Average product',
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-03'),
    user: {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: Role.USER,
      provider: Provider.LOCAL,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
];

// Mock Rating Average and Count
export const mockRatingAverage = {
  average: 4.0,
  count: 3,
};

// RatingsRepository mock implementation
export const mockRatingsRepository = {
  findByProduct: jest
    .fn()
    .mockImplementation((_productId, limit: number | undefined) => {
      // If limit is provided, return only that many items
      if (limit) {
        return Promise.resolve(mockRatingData.slice(0, limit));
      }

      return Promise.resolve(mockRatingData);
    }),

  getProductAverageRating: jest
    .fn()
    .mockReturnValue(Promise.resolve(mockRatingAverage)),

  create: jest.fn(),
  findByUserAndProduct: jest.fn(),
  findByBusiness: jest.fn(),
};
