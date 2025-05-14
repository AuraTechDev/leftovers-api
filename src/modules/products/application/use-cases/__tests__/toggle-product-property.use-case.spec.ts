import { Test, TestingModule } from '@nestjs/testing';
import { ToggleProductPropertyUseCase } from '../toggle-product-property.use-case';
import { ProductsRepository } from '../../../infrastructure/repositories/products.repository';
import { NotFoundException } from '@nestjs/common';

describe('ToggleProductPropertyUseCase', () => {
  let useCase: ToggleProductPropertyUseCase;
  let productsRepository: ProductsRepository;

  const mockProductsRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'Description',
    price: 10.0,
    quantity: 5,
    imageUrl: null,
    isFeatured: false,
    isDisabled: false,
    foodTypeId: null,
    businessId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
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
    productsRepository = module.get<ProductsRepository>(ProductsRepository);
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
      mockProductsRepository.findById.mockResolvedValue(mockProduct);
      const updatedProduct = { ...mockProduct, isFeatured: true };
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
      const featuredProduct = { ...mockProduct, isFeatured: true };
      mockProductsRepository.findById.mockResolvedValue(featuredProduct);
      const updatedProduct = { ...featuredProduct, isFeatured: false };
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
      mockProductsRepository.findById.mockResolvedValue(mockProduct);
      const updatedProduct = { ...mockProduct, isDisabled: true };
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
      const disabledProduct = { ...mockProduct, isDisabled: true };
      mockProductsRepository.findById.mockResolvedValue(disabledProduct);
      const updatedProduct = { ...disabledProduct, isDisabled: false };
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
