import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductUseCase } from '../create-product.use-case';
import { ProductsRepository } from '../../../infrastructure/repositories/products.repository';
import {
  createMockCreateProductDto,
  createMockProduct,
  createMockProductResponseDto,
  createMockProductsRepository,
} from '../../../__mocks__/product-use-cases.mock';

// Type for mock repository
type MockProductsRepository = ReturnType<typeof createMockProductsRepository>;

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let mockProductsRepository: MockProductsRepository;

  beforeEach(async () => {
    // Create mock repository
    mockProductsRepository = createMockProductsRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProductUseCase,
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateProductUseCase>(CreateProductUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should create a new product successfully', async () => {
      // Arrange
      const dto = createMockCreateProductDto();
      const createdProduct = createMockProduct();
      const expectedResponse = createMockProductResponseDto();

      mockProductsRepository.create.mockResolvedValue(createdProduct);

      // Act
      const result = await useCase.execute(dto);

      // Assert
      expect(mockProductsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: dto.name,
          description: dto.description,
          price: dto.price,
          quantity: dto.quantity,
          businessId: dto.businessId,
        }),
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should set default values for isFeatured and isDisabled when not provided', async () => {
      // Arrange
      const dto = createMockCreateProductDto({
        // Not specifying isFeatured or isDisabled
      });
      const createdProduct = createMockProduct();

      mockProductsRepository.create.mockResolvedValue(createdProduct);

      // Act
      await useCase.execute(dto);

      // Assert
      expect(mockProductsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isFeatured: false,
          isDisabled: false,
        }),
      );
    });

    it('should use provided values for isFeatured and isDisabled when specified', async () => {
      // Arrange
      const dto = createMockCreateProductDto({
        isFeatured: true,
        isDisabled: true,
      });
      const createdProduct = createMockProduct({
        isFeatured: true,
        isDisabled: true,
      });

      mockProductsRepository.create.mockResolvedValue(createdProduct);

      // Act
      await useCase.execute(dto);

      // Assert
      expect(mockProductsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          isFeatured: true,
          isDisabled: true,
        }),
      );
    });

    it('should include optional fields when provided', async () => {
      // Arrange
      const dto = createMockCreateProductDto({
        imageUrl: 'http://example.com/image.jpg',
        foodTypeId: 2,
      });
      const createdProduct = createMockProduct({
        imageUrl: 'http://example.com/image.jpg',
        foodTypeId: 2,
      });

      mockProductsRepository.create.mockResolvedValue(createdProduct);

      // Act
      await useCase.execute(dto);

      // Assert
      expect(mockProductsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          imageUrl: 'http://example.com/image.jpg',
          foodTypeId: 2,
        }),
      );
    });
  });
});
