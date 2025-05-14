import {
  ProductRatingItemDto,
  ProductRatingsResponseDto,
} from '../application/dtos/product-ratings-response.dto';

// Mock for Product Rating
export interface MockProductRating {
  id: number;
  rating: number;
  comment: string;
  userId: number;
  productId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create a mock product rating
export const createMockProductRating = (
  override: Partial<MockProductRating> = {},
): MockProductRating => ({
  id: 1,
  rating: 4,
  comment: 'Great product!',
  userId: 1,
  productId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...override,
});

// Create a mock ProductRatingItemDto
export const createMockProductRatingItemDto = (
  override: Partial<Omit<MockProductRating, 'productId'>> = {},
): ProductRatingItemDto => {
  const rating = createMockProductRating(override);

  return {
    id: rating.id,
    rating: rating.rating,
    comment: rating.comment,
    userId: rating.userId,
    user: {
      id: rating.userId,
      name: 'User Name',
    },
    createdAt: rating.createdAt,
  };
};

// Create an array of mock product rating items
export const createMockProductRatingItemsArray = (
  count = 3,
): ProductRatingItemDto[] => {
  return Array.from({ length: count }, (_, index) =>
    createMockProductRatingItemDto({ id: index + 1, userId: index + 1 }),
  );
};

// Create a mock product ratings response
export const createMockProductRatingsResponse = (
  override: Partial<ProductRatingsResponseDto> = {},
): ProductRatingsResponseDto => {
  const ratingsArray = createMockProductRatingItemsArray();

  return {
    average: 4.0,
    count: ratingsArray.length,
    ratings: ratingsArray,
    ...override,
  };
};

// Mock for GetProductRatingsUseCase
export const createMockGetProductRatingsUseCase = () => ({
  execute: jest.fn(),
});
