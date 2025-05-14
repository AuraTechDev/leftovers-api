import { Test, TestingModule } from '@nestjs/testing';
import { RatingsRepository } from '../ratings.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  createMockPrismaService,
  createMockRatingData,
  createMockRatingWithRelations,
  createMockRatingsWithRelationsList,
  MockPrismaService,
} from '../../../__mocks__/ratings-repository.mock';

describe('RatingsRepository', () => {
  let repository: RatingsRepository;
  let mockPrismaService: MockPrismaService;

  beforeEach(async () => {
    // Create a mock of the PrismaService
    mockPrismaService = createMockPrismaService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    repository = module.get<RatingsRepository>(RatingsRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a rating', async () => {
      // Arrange
      const ratingData = createMockRatingData();
      const expectedRating = createMockRatingWithRelations();

      mockPrismaService.rating.create.mockResolvedValue(expectedRating);

      // Act
      const result = await repository.create(ratingData);

      // Assert
      expect(mockPrismaService.rating.create).toHaveBeenCalledWith({
        data: ratingData,
        include: {
          user: true,
          product: true,
          business: true,
        },
      });
      expect(result).toEqual(expectedRating);
    });
  });

  describe('findByUserAndProduct', () => {
    it('should find a rating by user and product ids', async () => {
      // Arrange
      const userId = 123;
      const productId = 456;
      const expectedRating = createMockRatingWithRelations();

      mockPrismaService.rating.findUnique.mockResolvedValue(expectedRating);

      // Act
      const result = await repository.findByUserAndProduct(userId, productId);

      // Assert
      expect(mockPrismaService.rating.findUnique).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        include: {
          user: true,
          product: true,
          business: true,
        },
      });
      expect(result).toEqual(expectedRating);
    });

    it('should return null if rating not found', async () => {
      // Arrange
      const userId = 999;
      const productId = 999;
      mockPrismaService.rating.findUnique.mockResolvedValue(null);

      // Act
      const result = await repository.findByUserAndProduct(userId, productId);

      // Assert
      expect(mockPrismaService.rating.findUnique).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        include: {
          user: true,
          product: true,
          business: true,
        },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByProduct', () => {
    it('should find ratings by product id', async () => {
      // Arrange
      const productId = 456;
      const expectedRatings = createMockRatingsWithRelationsList();

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

    it('should limit the number of ratings returned when limit is provided', async () => {
      // Arrange
      const productId = 456;
      const limit = 1;
      const expectedRatings = [createMockRatingWithRelations()];

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

  describe('findByBusiness', () => {
    it('should find all ratings for a business when no options are provided', async () => {
      // Arrange
      const businessId = 789;
      const expectedRatings = createMockRatingsWithRelationsList();

      mockPrismaService.rating.findMany.mockResolvedValue(expectedRatings);

      // Act
      const result = await repository.findByBusiness(businessId);

      // Assert
      expect(mockPrismaService.rating.findMany).toHaveBeenCalledWith({
        where: { businessId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          product: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(expectedRatings);
    });

    it('should filter by productId when provided', async () => {
      // Arrange
      const businessId = 789;
      const productId = 456;
      const expectedRatings = createMockRatingsWithRelationsList();

      mockPrismaService.rating.findMany.mockResolvedValue(expectedRatings);

      // Act
      const result = await repository.findByBusiness(businessId, { productId });

      // Assert
      expect(mockPrismaService.rating.findMany).toHaveBeenCalledWith({
        where: { businessId, productId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          product: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(expectedRatings);
    });

    it('should filter by ratingValue when provided', async () => {
      // Arrange
      const businessId = 789;
      const ratingValue = 5;
      const expectedRatings = createMockRatingsWithRelationsList().map((r) => ({
        ...r,
        rating: ratingValue,
      }));

      mockPrismaService.rating.findMany.mockResolvedValue(expectedRatings);

      // Act
      const result = await repository.findByBusiness(businessId, {
        ratingValue,
      });

      // Assert
      expect(mockPrismaService.rating.findMany).toHaveBeenCalledWith({
        where: { businessId, rating: ratingValue },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          product: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(expectedRatings);
    });

    it('should filter by date range when provided', async () => {
      // Arrange
      const businessId = 789;
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      const expectedRatings = createMockRatingsWithRelationsList();

      mockPrismaService.rating.findMany.mockResolvedValue(expectedRatings);

      // Act
      const result = await repository.findByBusiness(businessId, {
        startDate,
        endDate,
      });

      // Assert
      expect(mockPrismaService.rating.findMany).toHaveBeenCalledWith({
        where: {
          businessId,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          product: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(expectedRatings);
    });

    it('should filter by startDate only when endDate is not provided', async () => {
      // Arrange
      const businessId = 789;
      const startDate = new Date('2023-01-01');
      const expectedRatings = createMockRatingsWithRelationsList();

      mockPrismaService.rating.findMany.mockResolvedValue(expectedRatings);

      // Act
      const result = await repository.findByBusiness(businessId, { startDate });

      // Assert
      expect(mockPrismaService.rating.findMany).toHaveBeenCalledWith({
        where: {
          businessId,
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          product: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(expectedRatings);
    });

    it('should filter by endDate only when startDate is not provided', async () => {
      // Arrange
      const businessId = 789;
      const endDate = new Date('2023-12-31');
      const expectedRatings = createMockRatingsWithRelationsList();

      mockPrismaService.rating.findMany.mockResolvedValue(expectedRatings);

      // Act
      const result = await repository.findByBusiness(businessId, { endDate });

      // Assert
      expect(mockPrismaService.rating.findMany).toHaveBeenCalledWith({
        where: {
          businessId,
          createdAt: {
            lte: endDate,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          product: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(expectedRatings);
    });

    it('should combine all filters when provided', async () => {
      // Arrange
      const businessId = 789;
      const productId = 456;
      const ratingValue = 5;
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-12-31');
      const expectedRatings = createMockRatingsWithRelationsList().map((r) => ({
        ...r,
        rating: ratingValue,
      }));

      mockPrismaService.rating.findMany.mockResolvedValue(expectedRatings);

      // Act
      const result = await repository.findByBusiness(businessId, {
        productId,
        ratingValue,
        startDate,
        endDate,
      });

      // Assert
      expect(mockPrismaService.rating.findMany).toHaveBeenCalledWith({
        where: {
          businessId,
          productId,
          rating: ratingValue,
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
          product: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(result).toEqual(expectedRatings);
    });
  });
});
