import { Test, TestingModule } from '@nestjs/testing';
import { DeleteProductUseCase } from '../delete-product.use-case';
import { ProductsRepository } from '../../../infrastructure/repositories/products.repository';
import { NotFoundException } from '@nestjs/common';
import {
  createMockProduct,
  createMockProductsRepository,
} from '../../../__mocks__/product-use-cases.mock';

// Type for mock repository
type MockProductsRepository = ReturnType<typeof createMockProductsRepository>;

describe('DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase;
  let mockProductsRepository: MockProductsRepository;

  beforeEach(async () => {
    // Create mock repository
    mockProductsRepository = createMockProductsRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteProductUseCase,
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteProductUseCase>(DeleteProductUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete a product successfully', async () => {
      // Arrange
      const productId = 1;
      const existingProduct = createMockProduct({ id: productId });

      mockProductsRepository.findById.mockResolvedValue(existingProduct);
      mockProductsRepository.delete.mockResolvedValue(undefined);

      // Act
      await useCase.execute(productId);

      // Assert
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockProductsRepository.delete).toHaveBeenCalledWith(productId);
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
      expect(mockProductsRepository.delete).not.toHaveBeenCalled();
    });

    it('should propagate any errors from the repository', async () => {
      // Arrange
      const productId = 1;
      const existingProduct = createMockProduct({ id: productId });
      const genericError = new Error('Database error');

      mockProductsRepository.findById.mockResolvedValue(existingProduct);
      mockProductsRepository.delete.mockRejectedValue(genericError);

      // Act & Assert
      await expect(useCase.execute(productId)).rejects.toThrow(genericError);
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(productId);
      expect(mockProductsRepository.delete).toHaveBeenCalledWith(productId);
    });
  });
});
