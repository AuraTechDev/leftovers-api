import { Test, TestingModule } from '@nestjs/testing';
import { GetAllProductsUseCase } from '../get-all-products.use-case';
import { ProductsRepository } from '../../../infrastructure/repositories/products.repository';
import {
  createMockProduct,
  createMockProductsRepository,
} from '../../../__mocks__/product-use-cases.mock';

// Type for mock repository
type MockProductsRepository = ReturnType<typeof createMockProductsRepository>;

describe('GetAllProductsUseCase', () => {
  let useCase: GetAllProductsUseCase;
  let mockProductsRepository: MockProductsRepository;

  beforeEach(async () => {
    // Create mock repository
    mockProductsRepository = createMockProductsRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAllProductsUseCase,
        {
          provide: ProductsRepository,
          useValue: mockProductsRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetAllProductsUseCase>(GetAllProductsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return all products when no businessId is provided', async () => {
      // Arrange
      const products = [
        createMockProduct({ id: 1, name: 'Product 1', businessId: 1 }),
        createMockProduct({ id: 2, name: 'Product 2', businessId: 2 }),
        createMockProduct({ id: 3, name: 'Product 3', businessId: 3 }),
      ];

      mockProductsRepository.findAll.mockResolvedValue(products);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(mockProductsRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(
        expect.objectContaining({ id: 1, name: 'Product 1' }),
      );
      expect(result[1]).toEqual(
        expect.objectContaining({ id: 2, name: 'Product 2' }),
      );
      expect(result[2]).toEqual(
        expect.objectContaining({ id: 3, name: 'Product 3' }),
      );
    });

    it('should return products filtered by businessId when provided', async () => {
      // Arrange
      const businessId = 1;
      const products = [
        createMockProduct({ id: 1, name: 'Product 1', businessId }),
        createMockProduct({ id: 4, name: 'Product 4', businessId }),
      ];

      mockProductsRepository.findAll.mockResolvedValue(products);

      // Act
      const result = await useCase.execute(businessId);

      // Assert
      expect(mockProductsRepository.findAll).toHaveBeenCalledWith(businessId);
      expect(result).toHaveLength(2);
      expect(result[0].businessId).toEqual(businessId);
      expect(result[1].businessId).toEqual(businessId);
    });

    it('should return empty array when no products exist', async () => {
      // Arrange
      mockProductsRepository.findAll.mockResolvedValue([]);

      // Act
      const result = await useCase.execute();

      // Assert
      expect(mockProductsRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([]);
    });

    it('should propagate any errors from the repository', async () => {
      // Arrange
      const genericError = new Error('Database error');
      mockProductsRepository.findAll.mockRejectedValue(genericError);

      // Act & Assert
      await expect(useCase.execute()).rejects.toThrow(genericError);
      expect(mockProductsRepository.findAll).toHaveBeenCalledWith(undefined);
    });
  });
});
