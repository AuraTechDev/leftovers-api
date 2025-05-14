import { Test, TestingModule } from '@nestjs/testing';
import { ProductRatingsRepository } from '../product-ratings.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  MockPrismaService,
  createMockPrismaService,
  createMockRatingsArray,
  createMockRatingsForAverage,
} from '../../../__mocks__/product-ratings-repository.mock';

describe('ProductRatingsRepository', () => {
  let repository: ProductRatingsRepository;
  let mockPrismaService: MockPrismaService;

  beforeEach(async () => {
    // Create a mock of the PrismaService
    mockPrismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductRatingsRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<ProductRatingsRepository>(ProductRatingsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByProduct', () => {
    it('should return ratings for a product with default limit', async () => {
      // Arrange
      const productId = 1;
      const expectedRatings = createMockRatingsArray();

      mockPrismaService.rating.findMany.mockResolvedValue(expectedRatings);

      // Act
      const result = await repository.findByProduct(productId);

      // Assert
      expect(mockPrismaService.rating.findMany).toHaveBeenCalledWith({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: undefined,
      });
      expect(result).toEqual(expectedRatings);
    });

    it('should return ratings for a product with specified limit', async () => {
      // Arrange
      const productId = 1;
      const limit = 5;
      const expectedRatings = createMockRatingsArray(5);

      mockPrismaService.rating.findMany.mockResolvedValue(expectedRatings);

      // Act
      const result = await repository.findByProduct(productId, limit);

      // Assert
      expect(mockPrismaService.rating.findMany).toHaveBeenCalledWith({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
      });
      expect(result).toEqual(expectedRatings);
    });
  });

  describe('getProductAverageRating', () => {
    it('should calculate average rating and count correctly', async () => {
      // Arrange
      const productId = 1;
      const mockRatings = createMockRatingsForAverage([4, 5, 3]);
      mockPrismaService.rating.findMany.mockResolvedValue(mockRatings);

      // Expected values: (4 + 5 + 3) / 3 = 4.0, count = 3
      const expectedResult = { average: 4.0, count: 3 };

      // Act
      const result = await repository.getProductAverageRating(productId);

      // Assert
      expect(mockPrismaService.rating.findMany).toHaveBeenCalledWith({
        where: { productId },
        select: { rating: true },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should return zero average and count when no ratings exist', async () => {
      // Arrange
      const productId = 1;
      mockPrismaService.rating.findMany.mockResolvedValue([]);

      // Expected values when no ratings
      const expectedResult = { average: 0, count: 0 };

      // Act
      const result = await repository.getProductAverageRating(productId);

      // Assert
      expect(mockPrismaService.rating.findMany).toHaveBeenCalledWith({
        where: { productId },
        select: { rating: true },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should round average to one decimal place', async () => {
      // Arrange
      const productId = 1;
      const mockRatings = createMockRatingsForAverage([3, 4, 5, 5, 5]);
      mockPrismaService.rating.findMany.mockResolvedValue(mockRatings);

      // Expected values: (3 + 4 + 5 + 5 + 5) / 5 = 4.4, count = 5
      const expectedResult = { average: 4.4, count: 5 };

      // Act
      const result = await repository.getProductAverageRating(productId);

      // Assert
      expect(mockPrismaService.rating.findMany).toHaveBeenCalledWith({
        where: { productId },
        select: { rating: true },
      });
      expect(result).toEqual(expectedResult);
    });
  });
});
