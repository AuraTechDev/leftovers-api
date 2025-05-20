import { Test, TestingModule } from '@nestjs/testing';
import { RatingsController } from '../ratings.controller';
import { SubmitRatingUseCase } from '../../../application/use-cases/submit-rating.use-case';
import { GetBusinessRatingsUseCase } from '../../../application/use-cases/get-business-ratings.use-case';
import { CreateRatingDto } from '../../../application/dtos/create-rating.dto';
import { BusinessRatingsQueryDto } from '../../../application/dtos/business-ratings-query.dto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { mockRatings, mockUser } from '../../../__mocks__/ratings.mock';

// Mock objects for testing
const createMockSubmitRatingUseCase = () => ({
  execute: jest.fn(),
});

const createMockGetBusinessRatingsUseCase = () => ({
  execute: jest.fn(),
});

describe('RatingsController', () => {
  let controller: RatingsController;
  const mockSubmitRatingUseCase = createMockSubmitRatingUseCase();
  const mockGetBusinessRatingsUseCase = createMockGetBusinessRatingsUseCase();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RatingsController],
      providers: [
        {
          provide: SubmitRatingUseCase,
          useValue: mockSubmitRatingUseCase,
        },
        {
          provide: GetBusinessRatingsUseCase,
          useValue: mockGetBusinessRatingsUseCase,
        },
      ],
    }).compile();

    controller = module.get<RatingsController>(RatingsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('submitRating', () => {
    it('should submit a rating successfully', async () => {
      // Arrange
      const userId = 2;
      const createRatingDto: CreateRatingDto = {
        productId: 456,
        rating: 4,
        comment: 'Great product!',
      };
      const mockRating = {
        id: 1,
        userId,
        ...createRatingDto,
        businessId: 789,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockSubmitRatingUseCase.execute.mockResolvedValue(mockRating);

      // Act
      const result = await controller.submitRating(
        mockUser.id,
        createRatingDto,
      );

      // Assert
      expect(mockSubmitRatingUseCase.execute).toHaveBeenCalledWith(
        userId,
        createRatingDto,
      );
      expect(result).toEqual(mockRating);
    });

    it('should throw BadRequestException when user has already submitted a rating', async () => {
      // Arrange
      const userId = 2;
      const createRatingDto: CreateRatingDto = {
        productId: 456,
        rating: 4,
        comment: 'Great product!',
      };
      mockSubmitRatingUseCase.execute.mockRejectedValue(
        new BadRequestException(
          'You have already submitted a rating for this product',
        ),
      );

      // Act & Assert
      await expect(
        controller.submitRating(mockUser.id, createRatingDto),
      ).rejects.toThrow(BadRequestException);
      expect(mockSubmitRatingUseCase.execute).toHaveBeenCalledWith(
        userId,
        createRatingDto,
      );
    });

    it('should throw UnauthorizedException when user has not purchased the product', async () => {
      // Arrange
      const userId = 2;
      const createRatingDto: CreateRatingDto = {
        productId: 456,
        rating: 4,
        comment: 'Great product!',
      };
      mockSubmitRatingUseCase.execute.mockRejectedValue(
        new UnauthorizedException(
          'You can only rate products you have purchased and received',
        ),
      );

      // Act & Assert
      await expect(
        controller.submitRating(mockUser.id, createRatingDto),
      ).rejects.toThrow(UnauthorizedException);
      expect(mockSubmitRatingUseCase.execute).toHaveBeenCalledWith(
        userId,
        createRatingDto,
      );
    });
  });

  describe('getBusinessRatings', () => {
    it('should return business ratings successfully', async () => {
      // Arrange
      const businessId = 789;
      const query: BusinessRatingsQueryDto = {
        productId: 456,
        ratingValue: 4,
        startDate: '2023-01-01',
        endDate: '2023-12-31',
      };
      mockGetBusinessRatingsUseCase.execute.mockResolvedValue(mockRatings);

      // Act
      const result = await controller.getBusinessRatings(businessId, query);

      // Assert
      expect(mockGetBusinessRatingsUseCase.execute).toHaveBeenCalledWith(
        businessId,
        query,
      );
      expect(result).toEqual(mockRatings);
    });

    it('should return empty array when no ratings are found', async () => {
      // Arrange
      const businessId = 789;
      const query: BusinessRatingsQueryDto = {
        productId: 999, // non-existent product
      };
      mockGetBusinessRatingsUseCase.execute.mockResolvedValue([]);

      // Act
      const result = await controller.getBusinessRatings(businessId, query);

      // Assert
      expect(mockGetBusinessRatingsUseCase.execute).toHaveBeenCalledWith(
        businessId,
        query,
      );
      expect(result).toEqual([]);
    });
  });
});
