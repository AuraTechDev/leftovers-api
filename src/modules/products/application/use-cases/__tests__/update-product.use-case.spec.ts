import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProductUseCase } from '../update-product.use-case';
import { ProductsRepository } from '../../../infrastructure/repositories/products.repository';
import { NotFoundException } from '@nestjs/common';
import {
  createMockProduct,
  createMockUpdateProductDto,
  createMockProductsRepository,
  createPrismaUniqueConstraintError,
} from '../../../__mocks__/product-use-cases.mock';

// Type for mock repository
type MockProductsRepository = ReturnType<typeof createMockProductsRepository>;

describe('UpdateProductUseCase', () => {
  let useCase: UpdateProductUseCase;
  let mockProductsRepository: MockProductsRepository;

  beforeEach(async () => {
    // Create mock repository
    mockProductsRepository = createMockProductsRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProductUseCase,
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateProductUseCase>(UpdateProductUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update a product successfully', async () => {
      // Arrange
      const productId = 1;
      const existingProduct = createMockProduct({
        id: productId,
        name: 'Original Product',
      });
      const updateDto = createMockUpdateProductDto({
        name: 'Updated Product',
        price: 20.0,
      });
      const updatedProduct = createMockProduct({
        id: productId,
        name: 'Updated Product',
        price: 20.0,
        updatedAt: new Date(),
      });

      mockProductsRepository.findById.mockResolvedValue(existingProduct);
      mockProductsRepository.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await useCase.execute(productId, updateDto);

      // Assert
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockProductsRepository.update).toHaveBeenCalledWith(
        productId,
        updateDto,
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: productId,
          name: 'Updated Product',
          price: 20.0,
        }),
      );
    });

    it('should throw NotFoundException when product does not exist', async () => {
      // Arrange
      const productId = 999;
      const updateDto = createMockUpdateProductDto();

      mockProductsRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(productId, updateDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockProductsRepository.update).not.toHaveBeenCalled();
    });

    it('should update partial product properties', async () => {
      // Arrange
      const productId = 1;
      const existingProduct = createMockProduct({
        id: productId,
        name: 'Original Product',
        price: 10.0,
        isFeatured: false,
      });

      // Only update the price
      const updateDto = createMockUpdateProductDto({
        price: 15.0,
      });

      const updatedProduct = createMockProduct({
        id: productId,
        name: 'Original Product', // name unchanged
        price: 15.0, // price updated
        isFeatured: false, // unchanged
        updatedAt: new Date(),
      });

      mockProductsRepository.findById.mockResolvedValue(existingProduct);
      mockProductsRepository.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await useCase.execute(productId, updateDto);

      // Assert
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockProductsRepository.update).toHaveBeenCalledWith(
        productId,
        updateDto,
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: productId,
          name: 'Original Product',
          price: 15.0,
          isFeatured: false,
        }),
      );
    });

    it('should handle unique constraint violation errors', async () => {
      // Arrange
      const productId = 1;
      const existingProduct = createMockProduct({ id: productId });
      const updateDto = createMockUpdateProductDto();
      const uniqueConstraintError = createPrismaUniqueConstraintError(['name']);

      mockProductsRepository.findById.mockResolvedValue(existingProduct);
      mockProductsRepository.update.mockRejectedValue(uniqueConstraintError);

      // Act & Assert
      await expect(useCase.execute(productId, updateDto)).rejects.toThrow(
        Error,
      );
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockProductsRepository.update).toHaveBeenCalledWith(
        productId,
        updateDto,
      );
    });

    it('should propagate other errors from the repository', async () => {
      // Arrange
      const productId = 1;
      const existingProduct = createMockProduct({ id: productId });
      const updateDto = createMockUpdateProductDto();
      const genericError = new Error('Database error');

      mockProductsRepository.findById.mockResolvedValue(existingProduct);
      mockProductsRepository.update.mockRejectedValue(genericError);

      // Act & Assert
      await expect(useCase.execute(productId, updateDto)).rejects.toThrow(
        genericError,
      );
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockProductsRepository.update).toHaveBeenCalledWith(
        productId,
        updateDto,
      );
    });
  });
});
