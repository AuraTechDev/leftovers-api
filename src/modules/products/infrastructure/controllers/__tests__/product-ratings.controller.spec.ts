import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductRatingsController } from '../product-ratings.controller';
import { GetProductRatingsUseCase } from '../../../application/use-cases/get-product-ratings.use-case';
import {
  createMockGetProductRatingsUseCase,
  createMockProductRatingsResponse,
} from '../../../__mocks__/product-ratings.mock';

describe('ProductRatingsController', () => {
  let controller: ProductRatingsController;
  const mockGetProductRatingsUseCase = createMockGetProductRatingsUseCase();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductRatingsController],
      providers: [
        {
          provide: GetProductRatingsUseCase,
          useValue: mockGetProductRatingsUseCase,
        },
      ],
    }).compile();

    controller = module.get<ProductRatingsController>(ProductRatingsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProductRatings', () => {
    it('should return product ratings when product exists', async () => {
      // Arrange
      const productId = 1;
      const mockRatings = createMockProductRatingsResponse();
      mockGetProductRatingsUseCase.execute.mockResolvedValue(mockRatings);

      // Act
      const result = await controller.getProductRatings(productId);

      // Assert
      expect(mockGetProductRatingsUseCase.execute).toHaveBeenCalledWith(
        productId,
      );
      expect(result).toEqual(mockRatings);
    });

    it('should propagate NotFoundException when product does not exist', async () => {
      // Arrange
      const productId = 999;
      mockGetProductRatingsUseCase.execute.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      // Act & Assert
      await expect(controller.getProductRatings(productId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockGetProductRatingsUseCase.execute).toHaveBeenCalledWith(
        productId,
      );
    });
  });
});
