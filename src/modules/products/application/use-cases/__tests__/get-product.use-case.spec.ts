import { Test, TestingModule } from '@nestjs/testing';
import { GetProductUseCase } from '../get-product.use-case';
import { ProductsRepository } from '../../../infrastructure/repositories/products.repository';
import { NotFoundException } from '@nestjs/common';
import {
  createMockProduct,
  createMockProductsRepository,
} from '../../../__mocks__/product-use-cases.mock';

// Type for mock repository
type MockProductsRepository = ReturnType<typeof createMockProductsRepository>;

describe('GetProductUseCase', () => {
  let useCase: GetProductUseCase;
  let mockProductsRepository: MockProductsRepository;

  beforeEach(async () => {
    // Create mock repository
    mockProductsRepository = createMockProductsRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProductUseCase,
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetProductUseCase>(GetProductUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return a product when it exists', async () => {
      // Arrange
      const productId = 1;
      const product = createMockProduct({
        id: productId,
        name: 'Test Product',
      });

      mockProductsRepository.findById.mockResolvedValue(product);

      // Act
      const result = await useCase.execute(productId);

      // Assert
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
      expect(result).toEqual(
        expect.objectContaining({
          id: productId,
          name: 'Test Product',
        }),
      );
    });

    it('should throw NotFoundException when product does not exist', async () => {
      // Arrange
      const productId = 999;
      mockProductsRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(productId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
    });

    it('should include all product properties in the response', async () => {
      // Arrange
      const productId = 1;
      const product = createMockProduct({
        id: productId,
        name: 'Test Product',
        description: 'Test Description',
        price: 15.99,
        quantity: 10,
        imageUrl: 'http://example.com/image.jpg',
        isFeatured: true,
        isDisabled: false,
        foodTypeId: 2,
        businessId: 3,
      });

      mockProductsRepository.findById.mockResolvedValue(product);

      // Act
      const result = await useCase.execute(productId);

      // Assert
      expect(result).toEqual(
        expect.objectContaining({
          id: productId,
          name: 'Test Product',
          description: 'Test Description',
          price: 15.99,
          quantity: 10,
          imageUrl: 'http://example.com/image.jpg',
          isFeatured: true,
          isDisabled: false,
          businessId: 3,
        }),
      );
    });

    it('should propagate any errors from the repository', async () => {
      // Arrange
      const productId = 1;
      const genericError = new Error('Database error');
      mockProductsRepository.findById.mockRejectedValue(genericError);

      // Act & Assert
      await expect(useCase.execute(productId)).rejects.toThrow(genericError);
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
    });
  });
});
