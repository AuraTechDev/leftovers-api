import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetProductRatingsUseCase } from '../get-product-ratings.use-case';
import {
  mockRatingsRepository,
  mockRatingData,
  mockRatingAverage,
} from '../../../__mocks__/ratings-repository.mock';
import { createMockProduct } from '../../../__mocks__/products-repository.mock';
import { ProductsRepository } from '../../../infrastructure/repositories/products.repository';
import { RatingsRepository } from '../../../../ratings/infrastructure/repositories/ratings.repository';

describe('GetProductRatingsUseCase', () => {
  let useCase: GetProductRatingsUseCase;
  const productId = 1;
  const mockProduct = createMockProduct({ id: productId });

  // Create mocks
  const mockProductsRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockProductsRepository.findById.mockResolvedValue(mockProduct);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductRatingsUseCase,
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository,
        },
        {
          provide: RatingsRepository,
          useValue: mockRatingsRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetProductRatingsUseCase>(GetProductRatingsUseCase);

    // Set up mock returns directly before tests
    mockRatingsRepository.getProductAverageRating.mockReturnValue(
      mockRatingAverage,
    );
    mockRatingsRepository.findByProduct.mockReturnValue(mockRatingData);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return product ratings with average, count, and formatted rating items', async () => {
      // Act
      const result = await useCase.execute(productId);

      // Assert
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
      expect(
        mockRatingsRepository.getProductAverageRating,
      ).toHaveBeenCalledWith(productId);
      expect(mockRatingsRepository.findByProduct).toHaveBeenCalledWith(
        productId,
        10,
      );

      expect(result.average).toEqual(mockRatingAverage.average);
      expect(result.count).toEqual(mockRatingAverage.count);
      expect(Array.isArray(result.ratings)).toBe(true);

      // Check that ratings are properly formatted
      expect(result.ratings).toHaveLength(mockRatingData.length);
    });

    it('should throw NotFoundException if product is not found', async () => {
      // Arrange
      mockProductsRepository.findById.mockResolvedValueOnce(null);

      // Act & Assert
      await expect(useCase.execute(productId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
      expect(
        mockRatingsRepository.getProductAverageRating,
      ).not.toHaveBeenCalled();
      expect(mockRatingsRepository.findByProduct).not.toHaveBeenCalled();
    });

    it('should handle empty ratings gracefully', async () => {
      // Arrange
      mockRatingsRepository.findByProduct.mockReturnValueOnce([]);
      mockRatingsRepository.getProductAverageRating.mockReturnValueOnce({
        average: 0,
        count: 0,
      });

      // Act
      const result = await useCase.execute(productId);

      // Assert
      expect(result).toEqual({
        average: 0,
        count: 0,
        ratings: [],
      });
    });
  });
});
