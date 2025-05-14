import { Test, TestingModule } from '@nestjs/testing';
import { ToggleProductPropertyUseCase } from '../toggle-product-property.use-case';
import { ProductsRepository } from '../../../infrastructure/repositories/products.repository';
import { NotFoundException } from '@nestjs/common';
import {
  createMockProduct,
  createFeaturedProduct,
  createDisabledProduct,
  createMockProductsRepository,
} from '../../../__mocks__/product-use-cases.mock';

// Type for mock products repository
type MockProductsRepository = ReturnType<typeof createMockProductsRepository>;

describe('ToggleProductPropertyUseCase', () => {
  let useCase: ToggleProductPropertyUseCase;
  let mockProductsRepository: MockProductsRepository;

  beforeEach(async () => {
    // Create mock repository
    mockProductsRepository = createMockProductsRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToggleProductPropertyUseCase,
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository,
        },
      ],
    }).compile();

    useCase = module.get<ToggleProductPropertyUseCase>(
      ToggleProductPropertyUseCase,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should toggle isFeatured property from false to true', async () => {
      // Arrange
      const product = createMockProduct();
      mockProductsRepository.findById.mockResolvedValue(product);
      const updatedProduct = { ...product, isFeatured: true };
      mockProductsRepository.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await useCase.execute(1, 'isFeatured');

      // Assert
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(1);
      expect(mockProductsRepository.update).toHaveBeenCalledWith(1, {
        isFeatured: true,
      });
      expect(result.isFeatured).toBe(true);
    });

    it('should toggle isFeatured property from true to false', async () => {
      // Arrange
      const product = createFeaturedProduct();
      mockProductsRepository.findById.mockResolvedValue(product);
      const updatedProduct = { ...product, isFeatured: false };
      mockProductsRepository.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await useCase.execute(1, 'isFeatured');

      // Assert
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(1);
      expect(mockProductsRepository.update).toHaveBeenCalledWith(1, {
        isFeatured: false,
      });
      expect(result.isFeatured).toBe(false);
    });

    it('should toggle isDisabled property from false to true', async () => {
      // Arrange
      const product = createMockProduct();
      mockProductsRepository.findById.mockResolvedValue(product);
      const updatedProduct = { ...product, isDisabled: true };
      mockProductsRepository.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await useCase.execute(1, 'isDisabled');

      // Assert
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(1);
      expect(mockProductsRepository.update).toHaveBeenCalledWith(1, {
        isDisabled: true,
      });
      expect(result.isDisabled).toBe(true);
    });

    it('should toggle isDisabled property from true to false', async () => {
      // Arrange
      const product = createDisabledProduct();
      mockProductsRepository.findById.mockResolvedValue(product);
      const updatedProduct = { ...product, isDisabled: false };
      mockProductsRepository.update.mockResolvedValue(updatedProduct);

      // Act
      const result = await useCase.execute(1, 'isDisabled');

      // Assert
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(1);
      expect(mockProductsRepository.update).toHaveBeenCalledWith(1, {
        isDisabled: false,
      });
      expect(result.isDisabled).toBe(false);
    });

    it('should throw NotFoundException when product is not found', async () => {
      // Arrange
      mockProductsRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(1, 'isFeatured')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockProductsRepository.findById).toHaveBeenCalledWith(1);
      expect(mockProductsRepository.update).not.toHaveBeenCalled();
    });
  });
});
